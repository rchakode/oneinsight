/*
# File: oneinsight.js                                                             #
#                                                                                 #
# Copyright © 2014 by Rodrigue Chakode <rodrigue.chakode@gmail.com>               #
#                                                                                 #
# This file is part of oneInsight, authored by Rodrigue Chakode as part of        #
# RealOpInsight Labs (http://realopinsight.com).                                  #
#                                                                                 #
# oneInsight is licensed under the Apache License, Version 2.0 (the "License");   #
# you may not use this file except in compliance with the License. You may obtain #
# a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0            #
#                                                                                 #
# Unless required by applicable law or agreed to in writing, software distributed #
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR     #
# CONDITIONS OF ANY KIND, either express or implied. See the License for the      #
# specific language governing permissions and limitations under the License.      #
*/
var HOST_INIT                 = 0; // Initial state for enabled hosts
var HOST_MONITORING_MONITORED = 1; // Monitoring the host (from monitored)
var HOST_MONITORED            = 2; // The host has been successfully monitored
var HOST_ERROR                = 3; // An error ocurrer while monitoring the host
var HOST_DISABLED             = 4; // The host is disabled won't be monitored
var HOST_MONITORING_ERROR     = 5; // Monitoring the host (from error)
var HOST_MONITORING_INIT      = 6; // Monitoring the host (from init)
var HOST_MONITORING_DISABLED  = 7; // Monitoring the host (from disabled)

function state2Text(state)
{
    var text = "";
    switch(state)
    {
    case HOST_INIT:
    case HOST_MONITORING_INIT:
        text = "Unknown";
        break;
    case HOST_MONITORING_MONITORED:
    case HOST_MONITORED:
        text = "Up";
        break;
    case HOST_ERROR:
    case HOST_MONITORING_ERROR:
        text = "Error";
        break;
    case HOST_DISABLED:
    case HOST_MONITORING_DISABLED:
        text = "Disable";
        break;
    default:
        break;
    }
    return text;
}
function setToolTip(nodeInfo)
{
    nodeInfo.tooltip = 'Host: '+nodeInfo.name;
    nodeInfo.tooltip += '\nID: '+nodeInfo.id;
    nodeInfo.tooltip += '\nState: '+ state2Text(nodeInfo.state);
    nodeInfo.tooltip += '\nCPU: '+ nodeInfo.nbCpu;
    nodeInfo.tooltip += '\n   Used: '+ 100 * Math.ceil(nodeInfo.cpuUsed / nodeInfo.maxCpu) + '%';
    nodeInfo.tooltip += '\n   Used by VMs: '+ 100 * Math.ceil(nodeInfo.cpuUsage / nodeInfo.maxCpu) + '%';
    nodeInfo.tooltip += '\nMemory: '+ nodeInfo.maxMem;
    nodeInfo.tooltip += '\n   Used: '+ 100 * Math.ceil(nodeInfo.memUsed / nodeInfo.maxMem) + '%';
    nodeInfo.tooltip += '\n   Used by VMs: '+ 100 * Math.ceil(nodeInfo.memUsage / nodeInfo.maxMem) + '%';
    nodeInfo.tooltip += '\nRunning VMs: '+nodeInfo.runningVms;
    nodeInfo.tooltip += '\nHypervisor: '+nodeInfo.hypervisor;
}

function computeHostLoad(nodeInfo, loadType)
{
    var load = 0;
    if (loadType == "CPU_USED")
        load = nodeInfo.cpuUsed / nodeInfo.maxCpu;
    else if (loadType == "CPU_USAGE")
        load = nodeInfo.cpuUsage / nodeInfo.maxCpu;
    else if (loadType == "MEM_USED")
        load = nodeInfo.memUsed / nodeInfo.maxMem;
    else if (loadType == "MEM_USAGE")
        load = nodeInfo.memUsage / nodeInfo.maxMem;

    return 100 * load;
}

function createPopupEntry(nodeInfo)
{
    var popupHtmlCode = '<div class="modal fade" id="'+nodeInfo.id+'" tabindex="-1" role="dialog" aria-labelledby="'+nodeInfo.name+'" aria-hidden="true">'
            +'<div class="modal-dialog">'
            +'<div class="modal-content">'
            +'<div class="modal-header">'
            +'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'
            +'<h4 class="modal-title" id="'+nodeInfo.name+'">'+nodeInfo.name+'</h4>'
            +'</div>'
            +'<div class="modal-body">'
            +''+nodeInfo.tooltip.replace(/\n/g, "<br />")+''
            +'</div>'
            +'<div class="modal-footer">'
            +'<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'
            +'</div>'
            +'</div>'
            +'</div>'
            +'</div>';

    return popupHtmlCode;
}

function displayHostLoadMap(xmlRpcResponse, loadType)
{
    var xmlRawData = $(xmlRpcResponse).find('methodResponse').find('data').eq(0);

    if ($(xmlRawData).find('boolean').text() == 1)
    {
        $( "#load-map-container" ).empty();
        $( "#host-list-container" ).html('<ul class="list-unstyled">');
        var hostListContent = '';
        var popupContent = '';

        var DRAWING_AREA = {width: 750, height: "100%"};
        var BASE_SHAPE_INFO = {unit: 10, margin: 2, node_margin: 4};
        var curPos = {x: BASE_SHAPE_INFO.node_margin, y : BASE_SHAPE_INFO.node_margin};
        var raphaelPaper = new Raphael("load-map-container", DRAWING_AREA.width, DRAWING_AREA.height);

        var maxNodeheight = 1;
        $( $.parseXML( $(xmlRawData).find('string').text() ) ).find('HOST').each(
                    function()
                    {
                        var nbRow = 1;
                        var nbCol = 1;
                        var nodeInfo = new Object();
                        nodeInfo.id = $(this).find('ID').text();
                        nodeInfo.maxCpu = Math.max(parseInt($(this).find('MAX_CPU').text()), 100);
                        nodeInfo.maxMem = parseInt($(this).find('MAX_MEM').text());
                        nodeInfo.name = $(this).find('HOSTNAME').text();
                        nodeInfo.state = parseInt( $(this).find('STATE').text() );
                        nodeInfo.cpuUsed = parseInt( $(this).find('USED_CPU').text() );
                        nodeInfo.cpuUsage = parseInt( $(this).find('CPU_USAGE').text() );
                        nodeInfo.memUsed = parseInt( $(this).find('USED_MEM').text() );
                        nodeInfo.memUsage = parseInt( $(this).find('MEM_USAGE').text() );
                        nodeInfo.runningVms = parseInt( $(this).find('RUNNING_VMS').text() );
                        nodeInfo.hypervisor = $(this).find('VM_MAD').text();
                        nodeInfo.nbCpu = Math.ceil(nodeInfo.maxCpu / 100);

                        setToolTip(nodeInfo);

                        hostListContent += '<li><a href="#" data-toggle="modal" data-target="#'+nodeInfo.id+'">host-'+nodeInfo.id +' -> '+ nodeInfo.name+'</a></li>';
                        popupContent += createPopupEntry(nodeInfo);

                        switch(nodeInfo.nbCpu) {
                        case 1:
                            nbRow = 1;
                            break;
                        case 2:
                        case 4:
                            nbRow = 2;
                            break;
                        case 6:
                        case 12:
                            nbRow = 6;
                            break;
                        case 8:
                        case 16:
                            nbRow = 4;
                            break;
                        default:
                            if (nodeInfo.nbCpu % 4 == 0)
                                nbRow = 4;
                            else if (nodeInfo.nbCpu % 6 == 0)
                                nbRow = 6;
                            else if (nodeInfo.nbCpu % 8 == 0)
                                nbRow = 8;
                            else
                                nbRow = Math.ceil(nodeInfo.nbCpu);
                            break;
                        } // end switch(nodeInfo.nbCpu)

                        nbCol = Math.ceil(nodeInfo.nbCpu / nbRow);

                        var curNodeShape = {
                            width: nbCol * BASE_SHAPE_INFO.unit + (nbCol - 1) * BASE_SHAPE_INFO.margin,
                            height: nbRow * BASE_SHAPE_INFO.unit + (nbRow - 1) * BASE_SHAPE_INFO.margin
                        };

                        maxNodeheight = Math.max(maxNodeheight, curNodeShape.height);

                        if (curPos.x + curNodeShape.width > DRAWING_AREA.width) {
                            curPos.y += maxNodeheight + BASE_SHAPE_INFO.node_margin;
                            curPos.x = BASE_SHAPE_INFO.node_margin;
                            maxNodeheight = curNodeShape.height;
                        } // end if (curPos.x + curNodeShape.width > DRAWING_AREA.width)


                        switch (nodeInfo.state) {
                        case HOST_MONITORED:
                        case HOST_MONITORING_MONITORED:
                            var hostLoad = computeHostLoad(nodeInfo, loadType);
                            if (hostLoad ===0)
                                nodeInfo.color = '#6699cc';              // dark blue
                            else if (hostLoad <=25)
                                nodeInfo.color = '#66ffcc';              // turquoise
                            else if (hostLoad <=50)
                                nodeInfo.color = '#ffff00';  // yellow
                            else if (hostLoad <=75)
                                nodeInfo.color = '#ff9900';               //light orange
                            else
                                nodeInfo.color = '#ff6600';              // dark orange
                            break;
                        case HOST_ERROR:
                        case HOST_MONITORING_ERROR:
                            nodeInfo.color = 'ff0000';                //red
                            break;
                        case HOST_INIT:
                        case HOST_DISABLED:
                        case HOST_MONITORING_INIT:
                        case HOST_MONITORING_DISABLED:
                            nodeInfo.color = '#c0c0c0';               // gray
                            break;
                        } // end switch (nodeInfo.state)

                        nodeInfo.shape = raphaelPaper.set();

                        for (var coreIndex=0; coreIndex < nodeInfo.nbCpu; ++coreIndex) {
                            var curShape = raphaelPaper.rect(curPos.x + Math.floor(coreIndex / nbRow) * (BASE_SHAPE_INFO.unit + BASE_SHAPE_INFO.margin),
                                                             curPos.y + (coreIndex % nbRow) * (BASE_SHAPE_INFO.unit + BASE_SHAPE_INFO.margin),
                                                             BASE_SHAPE_INFO.unit,
                                                             BASE_SHAPE_INFO.unit);
                            curShape.attr({fill: nodeInfo.color, 'stroke-width': 0});
                            curShape.attr({title: nodeInfo.tooltip});
                            nodeInfo.shape.push(curShape);
                        }
                        curPos.x += curNodeShape.width + BASE_SHAPE_INFO.node_margin;

                    });  // end for each host

        // set dynamic HTML content
        $("#load-map-container").height(curPos.y + maxNodeheight + BASE_SHAPE_INFO.node_margin);
        $("#host-list-container").html('<ul class="list-unstyled">'+hostListContent+"</ul>");
        $("#popup-container").html(popupContent);

    } // end if ($(xmlRawData).find('boolean').text() == 1)
}

function handleDisplayLoadByCpuUsedAction()
{
    $('#title-container').html("CPU Used");
    $.ajax({
               type: "GET",
               url: "../backend/hostpool.xml",
               dataType: "xml",
               success: function(data) {displayHostLoadMap(data, "CPU_USED");}
           });
}

function handleDisplayLoadByCpuUsageAction()
{
    $('#title-container').html("CPU Usage");
    $.ajax({
               type: "GET",
               url: "onehost.xml",
               dataType: "xml",
               success: function(data) {displayHostLoadMap(data, "CPU_USAGE");}
           });
}


function handleDisplayLoadByMemoryUsedAction()
{
    $('#title-container').html("Memory Used");
    $.ajax({
               type: "GET",
               url: "onehost.xml",
               dataType: "xml",
               success: function(data) {displayHostLoadMap(data, "MEM_USED");}
           });
}


function handleDisplayLoadByMemoryUsageAction()
{
    $('#title-container').html("Memory Usage");
    $.ajax({
               type: "GET",
               url: "onehost.xml",
               dataType: "xml",
               success: function(data) {displayHostLoadMap(data, "MEM_USAGE");}
           });
}


(function($)
{
    $(document).ready(function()
    {
        $.ajaxSetup(
                    {
                        cache: false,
                        beforeSend: function() {
                            $('#load-map-container').hide();
                            $('#loading-container').show();
                        },
                        complete: function() {
                            $('#loading-container').hide();
                            $('#load-map-container').show();
                        },
                        success: function() {
                            $('#loading-container').hide();
                            $('#load-map-container').show();
                        }
                    });
        var $container = $("#load-map-container");
        handleDisplayLoadByCpuUsedAction();
        var refreshId = setInterval(function() {handleDisplayLoadByCpuUsedAction();}, 5000000); // update every 5 mins
    });
})(jQuery);

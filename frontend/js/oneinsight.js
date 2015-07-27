/*
# File: oneinsight.js                                                             #
#                                                                                 #
# Copyright © 2014 by Rodrigue Chakode <rodrigue.chakode at gmail dot com>        #
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
        text = "Disabled";
        break;
    default:
        break;
    }
    return text;
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


function setToolTip(nodeInfo)
{
    nodeInfo.tooltip = 'Host: '+nodeInfo.name;
    nodeInfo.tooltip += '\nID: '+nodeInfo.id;
    nodeInfo.tooltip += '\nState: '+ state2Text(nodeInfo.state);
    nodeInfo.tooltip += '\nCPU: ' + nodeInfo.nbCpu;
    nodeInfo.tooltip += '\n   Used: ' + Math.ceil(computeHostLoad(nodeInfo, "CPU_USED")) + '%';
    nodeInfo.tooltip += '\n   Allocated to VMs: ' + Math.ceil(computeHostLoad(nodeInfo, "CPU_USAGE")) + '%'; 
    nodeInfo.tooltip += '\nMemory: ' + nodeInfo.maxMem;
    nodeInfo.tooltip += '\n   Used: ' + Math.ceil(computeHostLoad(nodeInfo, "MEM_USED")) + '%';  
    nodeInfo.tooltip += '\n   Allocated to VMs: ' + Math.ceil(computeHostLoad(nodeInfo, "MEM_USAGE")) + '%';  
    nodeInfo.tooltip += '\nRunning VMs: ' + nodeInfo.runningVms;
    nodeInfo.tooltip += '\nHypervisor: ' + nodeInfo.hypervisor;
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

    // if not data exit right now
    if ($(xmlRawData).find('boolean').text() != 1)
      return 
    
    $( "#load-map-container" ).empty();
    $( "#host-list-container" ).html('<ul class="list-unstyled">');
    var hostListContent = '';
    var popupContent = '';

    var nodeList = []
    var gridCelNbRow = 1
    var gridCelNbCol = 1
    $( $.parseXML( $(xmlRawData).find('string').text() ) ).find('HOST').each(
        function()
        {
            var nodeNbRow = 1;
            var nodeNbCol = 1;
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
                nodeNbRow = 1;
                break;
            case 2:
            case 4:
                nodeNbRow = 2;
                break;
            case 6:
            case 12:
                nodeNbRow = 6;
                break;
            case 8:
            case 16:
                nodeNbRow = 4;
                break;
            default:
                if (nodeInfo.nbCpu % 8 == 0)
                    nodeNbRow = 8
                else if (nodeInfo.nbCpu % 6 == 0)
                    nodeNbRow = 6;
                else if (nodeInfo.nbCpu % 4 == 0)
                    nodeNbRow = 4;
                else
                    nodeNbRow = Math.ceil(nodeInfo.nbCpu);
                break;
            } // end switch(nodeInfo.nbCpu)
            nodeNbCol = Math.ceil(nodeInfo.nbCpu / nodeNbRow);
            gridCelNbRow = Math.max(gridCelNbRow, nodeNbRow)
            gridCelNbCol = Math.max(gridCelNbCol, nodeNbCol)

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
            nodeList.push(nodeInfo)
        } // end for each callback
    );  // end for each host

        
    // now draw map
    var DRAWING_AREA = {width: 750, height: "100%"};
    var BASE_SHAPE_INFO = {unit: 10, margin: 2, node_margin: 4};
    var curPos = {x: BASE_SHAPE_INFO.node_margin, y : BASE_SHAPE_INFO.node_margin};
    var raphaelPaper = new Raphael("load-map-container", DRAWING_AREA.width, DRAWING_AREA.height);
    
    var nodeShapeSize = {
        width: gridCelNbCol * BASE_SHAPE_INFO.unit + (gridCelNbCol - 1) * BASE_SHAPE_INFO.margin,
        height: gridCelNbRow * BASE_SHAPE_INFO.unit + (gridCelNbRow - 1) * BASE_SHAPE_INFO.margin
    };
    
    // iterate over all the node
    $.each( nodeList, function(nodeIndex, nodeInfo) {
      
        // check if we can draw the node without overflowing the canvas
        if (curPos.x + nodeShapeSize.width > DRAWING_AREA.width) {
            curPos.y += nodeShapeSize.height + 2 * BASE_SHAPE_INFO.node_margin;
            curPos.x = BASE_SHAPE_INFO.node_margin;
        } // end if (curPos.x + nodeShapeSize.width > DRAWING_AREA.width)    
      
        // draw the node core per core
        nodeInfo.shape = raphaelPaper.set();
        for (var cpuIndex=0; cpuIndex < nodeInfo.nbCpu; ++cpuIndex) {
            var curShape = raphaelPaper.rect(curPos.x + Math.floor(cpuIndex / gridCelNbCol) * (BASE_SHAPE_INFO.unit + BASE_SHAPE_INFO.margin),
                                             curPos.y + (cpuIndex % gridCelNbCol) * (BASE_SHAPE_INFO.unit + BASE_SHAPE_INFO.margin),
                                             BASE_SHAPE_INFO.unit,
                                             BASE_SHAPE_INFO.unit);
            curShape.attr({fill: nodeInfo.color, 'stroke-width': 0});
            curShape.attr({title: nodeInfo.tooltip});
            nodeInfo.shape.push(curShape);
        }
        curPos.x += nodeShapeSize.width + 2 * BASE_SHAPE_INFO.node_margin;            //TODO
    });
    
    // set dynamic HTML content
    $("#load-map-container").height(curPos.y + nodeShapeSize.height + BASE_SHAPE_INFO.node_margin);
    $("#host-list-container").html('<ul class="list-unstyled">'+hostListContent+"</ul>");
    $("#popup-container").html(popupContent);
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
               url: "../backend/hostpool.xml",
               dataType: "xml",
               success: function(data) {displayHostLoadMap(data, "CPU_USAGE");}
           });
}


function handleDisplayLoadByMemoryUsedAction()
{
    $('#title-container').html("Memory Used");
    $.ajax({
               type: "GET",
               url: "../backend/hostpool.xml",
               dataType: "xml",
               success: function(data) {displayHostLoadMap(data, "MEM_USED");}
           });
}


function handleDisplayLoadByMemoryUsageAction()
{
    $('#title-container').html("Memory Usage");
    $.ajax({
               type: "GET",
               url: "../backend/hostpool.xml",
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

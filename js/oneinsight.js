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
    nodeInfo.tooltip += '\nState: '+ state2Text(nodeInfo.state);
    nodeInfo.tooltip += '\nCPU: '+ nodeInfo.nbCpu;
    nodeInfo.tooltip += '\n   Used: '+ Math.ceil(nodeInfo.cpuUsed / nodeInfo.maxCpu) + '%';
    nodeInfo.tooltip += '\n   Used by VMs: '+ Math.ceil(nodeInfo.cpuUsage / nodeInfo.maxCpu) + '%';
    nodeInfo.tooltip += '\nMemory: '+ nodeInfo.maxMem;
    nodeInfo.tooltip += '\n   Used: '+ Math.ceil(nodeInfo.memUsed / nodeInfo.maxMem) + '%';
    nodeInfo.tooltip += '\n   Used by VMs: '+ Math.ceil(nodeInfo.memUsage / nodeInfo.maxMem) + '%';
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

    return load;
}

function displayHostLoadMap(xmlRpcResponse, loadType)
{
    var xmlRawData = $(xmlRpcResponse).find('methodResponse').find('data').eq(0);

    if ($(xmlRawData).find('boolean').text() == 1)
    {
        var DRAWING_AREA = {width: 750, height: '100%'};
        var BASE_SHAPE_INFO = {unit: 10, margin: 2, node_margin: 4};
        var curPos = {x: BASE_SHAPE_INFO.node_margin, y : BASE_SHAPE_INFO.node_margin};

        $( "#load-map-container" ).empty();
        var raphaelPaper = new Raphael("load-map-container", DRAWING_AREA.width, DRAWING_AREA.height);

        $( $.parseXML( $(xmlRawData).find('string').text() ) ).find('HOST').each(
                    function()
                    {
                        var nodeInfo = new Object();
                        var nbRow = 1;
                        var nbCol = 1;
                        var maxNodeheight = nbRow;

                        nodeInfo.maxCpu = parseInt($(this).find('MAX_CPU').text());
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
                            if (hostLoad ==0)
                                nodeInfo.color = '#6699cc';              // dark blue
                            else if (hostLoad <=25)
                                nodeInfo.color = '#66ffcc';              // turquoise
                            else if (hostLoad <=50)
                                nodeInfo.color = '#ffff00';  // yellow
                            else if (hostLoad <=75)
                                nodeInfo.color = '#ff9900';               //light orange
                            else
                                nodeInfo.color = 'ff6600';              // dark orange
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
                        for (var index=0; index< nodeInfo.nbCpu; ++index) {
                            var curShape = raphaelPaper.rect(curPos.x + Math.floor(index / nbRow) * (BASE_SHAPE_INFO.unit + BASE_SHAPE_INFO.margin),
                                                             curPos.y + (index % nbRow) * (BASE_SHAPE_INFO.unit + BASE_SHAPE_INFO.margin),
                                                             BASE_SHAPE_INFO.unit,
                                                             BASE_SHAPE_INFO.unit);
                            curShape.attr({fill: nodeInfo.color, 'stroke-width': 0});
                            curShape.attr({title: nodeInfo.tooltip});
                            nodeInfo.shape.push(curShape);
                        }
                        curPos.x += curNodeShape.width + BASE_SHAPE_INFO.node_margin;

                    });  // end for each host
    } // end if ($(xmlRawData).find('boolean').text() == 1)
}

function handleDisplayLoadByCpuUsedAction()
{
    $('#title-container').html("CPU Used");
    $.ajax({
               type: "GET",
               url: "onehost.xml",
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

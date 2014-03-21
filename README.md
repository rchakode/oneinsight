RealOpInsight oneInsight
========================

Overview
--------
RealOpInsight oneInsight, or simply oneInsight, is a visualization add-on enables that allows 
to have an overview of the load of OpenNebula-managed hosts. oneInsight provides differents 
kinds of loads mapping, including for each host the mapping of:

* CPU used by virtual machines (VMs) versus the available CPU
* Memory used by VMs versus the available memory
* Effective CPU used (system processes including) versus the available CPU
* Effective memory used versus the available memory

Components
----------
oneInsight a fully HTML/Ajax/JJavascript stack built from modern Web libraries, 
such as, RaphaëlJs, jQuery, and Bootstrap.

A typical installation consist of the following components:
 
* A backend shell script ``curl-xml-rpc.sh`` to frequently pool host information
  via the OpenNebula's XML-RPC API. 
* A cron entry to periodically run the pooling script. 
* A Web frontend served by a Web server, Apache or any other Web servers. 

Installation
============
oneInsight works almost out-of-box with any OpenNebula installation.
In a typical installation, oneInsight is deployed on the OpenNebula 
server but you're free to install it on any server communicating with 
OpenNebula via the network.

Requirements
------------
  



RealOpInsight oneInsight
========================

Description
--------
RealOpInsight oneInsight, or simply oneInsight, is a visualization add-on enables that allows 
to have an overview of the load of OpenNebula-managed hosts. oneInsight provides differents 
kinds of loads mapping, including for each host the mapping of:

* CPU used by virtual machines (VMs)
* Memory used by VMs
* Effective CPU usage (CPU used by all system processes, including 
  processes outside VM)
* Effective memory usage (memory used by all system processes, including 
  processes outside VMs)

Oerview of oneInsight
---------------------
oneInsight a fully HTML/Ajax/JJavascript stack built from modern Web libraries, 
such as, RaphaëlJs, jQuery, and Bootstrap.

A typical installation consist of the following components:
 
* A backend shell script ``curl-xml-rpc.sh`` to frequently pool host information
  via the OpenNebula's XML-RPC API. 
* A crontab entry to periodically run the pooling script. 
* A Web frontend served by a Web server, Apache or any other Web servers. 


Getting Started
===============

Installation
============
In a typical installation, oneInsight can be deployed on the OpenNebula 
server. But you're free to install it on any server from where you can 
access the OpenNebula XML-RPC API.

Requirements
------------

**Server side**

oneInsight should work out-of-box on the vast majority of Linux operating systems 
subject to that they have the following tools:

  * curl command line interface
  * The Bash interpreter
  * The cron time-based job scheduler
  * A Web server like Apache and nginx 


**Client side**

All computer with a modern web browser should be sufficient. However Chrome, 
Firefox, Opera or Internet Explorer higher than IE7 are recommended.  


Get the Software
----------------
Go to the software home and download the latest tarball: 
http://realopinsight.com/oneinsight.

You can get the latest development versions via our Github repository: 
http://github.com/rchakode/realopinsight-oneinsight.

Installation Directory
----------------------
There is no special consideration about the installation directory, but below 
we consider an installation from the directory ``/opt/oneinsight``. Feel free to 
use another installation directory. In this case, think to adapt the installation 
path in the commands provided throughout this guide.

The installation directory consist of the following tree:
- ``backend``: contains pooling script as well as pooled data
- ``frontend``: contains web contents

Installing the Pooling Script
-----------------------------

* Uncompress the archive file
 
    ``$ tar zxf oneinsight-X.Y.Z.tar.gz``

   Replace X.Y.Z with the version of the software

* Move to the source directory

  ``$ cd oneinsight-X.Y.Z``
 
* Create the installation directory

    ``$ mkdir /opt/oneinsight``

* Create a directory named ``backend`` inside the installation directory
   
    ``$ mkdir  /opt/oneinsight/backend``

* Copy the pooling script from the source directory to the installation directory

    ``$ cp backend/curl-xml-rpc.sh  /opt/oneinsight/backend``

* Set environment variables. The pooling script requires you have the following OpenNebula 
  environment variables set:
  
  * ``ONE_AUTH``: must point to the path of ``one_auth`` file. In default installation of 
     OpenNebula this file is located in ~/.one/one_auth under the under the identity of 
    the ``oneadmin`` user.  
  * ``ONE_XMLRPC``: must contain the url to the OpenNebula's XML-RPC API endpoint.
    If oneInsight is installed on the OpenNebula server this should look as follows: 
    `http://localhost:2633/RPC2``.

* Once all the variables set, check that the pooling script works perfectly:

    ``$ bash /opt/oneinsight/backend/curl-xml-rpc.sh /opt/oneinsight/backend``

  In case of  success, you'll have a file named ``hostpool.xml`` under the directory
  ``/opt/oneinsight/frontend`` that containing a XML list of all host in OpenNebula. 
  Otherwise, fix possible errors before moving forward.

* Create crontab entry allowing to execute the polling script
   
    ``$ crontab -e`` 
   
    After the editor open, add the following line

     ``0 */5 * * * bash /opt/oneinsight/backend/curl-xml-rpc.sh /opt/oneinsight/backend``
 
   This allows to pool host information in OpenNebula every 5 minute, you can change the interval
   if needed.  


Installing the Web Frontend
---------------------------
Here the pooling script must operational. 

Installing oneInsight Web Frontend involves the following steps:


Check the Installation
----------------------
Launch a browser and go to the url where oneInsight frontend is installed. You'll have a screenshot
as follows, representing the load state of hosts in OpenNebula. The menu at the top allows to change 
load type (CPU used, CPU usage, memory used...).

In case of problem, check the log of your web server you learn details. 


Securiry Considerations
-----------------------
oneInsight is fully Javascript/HTML based and doesn't provides any security mecanism.
However, there are options to improve the security of your deployment.

Authentication and Authorization
--------------------------------
To add authentication support when accessing the Web frontend, a simple way is to 
use the basic HTTP authentication enabled by your server. Most of modern web servers
enable this. 

Below are steps needed to setup basic HTTP authentication with Apache:

* To go the oneInsight Web installation directory ``cd /opt/oneinsight``
* Create a file named ``.htaccess`` within the installation directory with following content:

<pre>
    <Location /opt/oneinsight>
       AuthName "oneInsight"
       AuthType Basic
       AuthBasicProvider file
       AuthUserFile /opt/oneinsight/passwords
    </Location>
</pre>

* Create the password file with a initial user named oneinsight
  ```
   htpasswd -c /var/oneinsight/passwords oneinsight
  ```
  You'll need to have sufficient permissions to write into the directory /var/lib/oneinsight

Ciphering
---------
As for authentication, you can deploy the web frontend of oneInsight so to benefit from the SSL support of your Web server. Consult the documentation of your Web server for more details. 


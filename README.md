RealOpInsight oneInsight
========================

Description
--------
RealOpInsight oneInsight, or simply oneInsight, is an OpenNebula visualization add-on that 
enables to have an insight on the load of managed hosts at a glance. oneInsight provides 
various kinds of load mapping, including for each host the mapping of:

* CPU used by OpenNebula-managed virtual machines (VMs).
* Memory used by OpenNebula-managed VMs.
* Effective CPU used by all system processes, including processes outside VM.
* Effective memory used by all system processes, including processes outside VMs.

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

Copying the Files
-----------------

* Uncompress the oneInsight tarball
 
            ``$ tar zxf oneinsight-X.Y.Z.tar.gz``

     Replace X.Y.Z with the version of the software
 
* Create the installation directory

            ``$ mkdir /opt/oneinsight/``

* Copy installation files

            ``$ cp -r oneinsight-X.Y.Z/{index.html,backend,frontend} /opt/oneinsight/``


Setting up the Pooling Script
-----------------------------
The pooling script is located in ``/opt/oneinsight/backend/curl-xml-rpc.sh``. Here are steps 
required for configuring the pooling of host information. 

* Set the following environment variables to tell where and how to connect to OpenNebula API.
  
    * ``ONE_AUTH``: must point to a file containing a valid authentication string in the form 
        of  ``username:password``. The pair ``username``, ``password`` should correspond to a
        valid user account within OpenNebula. Example to export the default one_auth file 
        as ``oneadmin`` user: 

            ``$ export ONE_AUTH=/var/lib/one/.one/one_auth``

    * ``ONE_XMLRPC``: must contain the url to the OpenNebula's XML-RPC API endpoint. For example, 
      if oneInsight is being installed on the OpenNebula server, you can export the environment 
      variable as follow:
       
            ``$ export ONE_XMLRPC=http://localhost:2633/RPC2``

* Once all the environment variables set, check that the pooling script works perfectly:

            ``$ bash /opt/oneinsight/backend/curl-xml-rpc.sh /opt/oneinsight/backend``

     On success you should have a file named ``hostpool.xml`` created under the directory 
     ``/opt/oneinsight/frontend``, this file contains a XML-list of OpenNebula's hosts. 
     Otherwise, fix all possible errors you may have encounter before moving forward.

* Create crontab entry to execute the polling script periodically.

    * Run the crontab editor:
   
        ``$ crontab -e`` 
   
    * Then add the following line at the end of the cron list and save the changes:

            ``0 */5 * * * bash /opt/oneinsight/backend/curl-xml-rpc.sh /opt/oneinsight/backend``
 
        This allows to pool host information in OpenNebula every 5 minutes, you can change the interval
        if necessary.  


Setting up the Web Frontend
---------------------------
Here the pooling script must operational. 

The oneInsight frontend requires a working web server. Covering all the available web servers 
is outside of the scope of this document, this quick guide focuses on the deployment under an
Apache server.

Deploying oneInsight under an Apache server is streamlined, assuming you have a recent version 
of Apache and that you have followed all the steps described above:

* Copy the ``conf/apache/oneinsight.conf`` from the source directory to the apache third-party configuration directory:

            ``$ cp conf/apache/oneinsight.conf /etc/apache2/conf.d/``

* Restart Apache 

            ``$ service apache2 restart``

* Check the setup by launching a browser and go to the url of oneInsight frontend 
  ``http://<your-server>/oneinsight/``.


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

* Edit the oneInsight Apache configuration located in ``/etc/apache2/conf.d/oneinsight.conf``
* Uncomment the following line

* Create a user account
  ```
   htpasswd -c /var/oneinsight/passwords oneinsight
  ```
  You'll need to have sufficient permissions to write into the directory /var/lib/oneinsight

Ciphering
---------
As for authentication, you can deploy the web frontend of oneInsight so to benefit from the SSL support of your Web server. Consult the documentation of your Web server for more details. 


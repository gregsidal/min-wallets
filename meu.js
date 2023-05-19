/*
Generates HTML footers, etc for Minimal Ethereum Utilities
Inherits web3ui.js license
*/
var MEU = {

  walletcreate:
    "<p class='wallet'>" +
      "<b>Create/Save Wallet</b>" +
      "<span class='subsec'>" +
        "<span class='control'>" +
          "<button class='create sameline' onclick='Web3UI.Wallet.new(true,true)'>Create</button> " +
          "<label for='Web3UI_0account_pktoggle' class='toggler sameline'>Open existing wallet</label>" +
          "<input type='checkbox' id='Web3UI_0account_pktoggle' class='toggler'></input>" +
          "<span class='toggle med closed'>" +
            "<span class='subsec'>" +
              "<span class='control'>" +
                "<button class='create' " + 
                        "onclick='Web3UI.Utils.gete(" + '"Web3UI_0account_file"' + ").click()'/>Open from File</button> " +
                "<input type='file' class='dispnone' accept='text/*' id='Web3UI_0account_file' " +
                       "onchange='Web3UI.Wallet.openfromfile(this.files[0],true,true);'/>" +
              "</span>" +
              "<span class='subsec'>" +
                "<span class='label tag'>Private key:</span>" +
                "<input type='text' id='Web3UI_0account_privatekey' class='pk' oninput='Web3UI.Wallet.clr()'/>" +
                "<button class='open' onclick='Web3UI.Wallet.open(true,true)'>Open from Input</button> " +
              "</span>" +
              "<span class='toggle closed' id='Web3UI_0account_openresponse_foldpane'>" +
                "<span class='subsec statusinfo'>" +
                  "<i id='Web3UI_0account_openresponse'></i>" +
                "</span>" +
              "</span>" +
            "</span>" +
          "</span>" +
        "</span>" +
      "</span>" +
      "<span class='toggle long closed' id='Web3UI_0account_addressshow_foldpane'>" +
        "<span class='subsec max'>" +
          "<span class='walletinfo'>" +
            "<span class='control'>" +
              "<span class='label tag'>Private Key</span>" +
              "<i class='key' id='Web3UI_0account_privatekeyshow'></i>" +
            "</span>" +
            "<span class='control med'>" +
              "<span class='label tag'>Address</span>" +
              "<i class='address selectable' id='Web3UI_0account_addressshow' onclick='Web3UI.Utils.select(this)'></i>" +
            "</span>" +
          "</span>" +
        "</span>" +
        "<span class='subsec'>" +
          "<span class='control'>" +
            "<span id='Web3UI_0account_savefiletag' class='label tag'>File name:</span> " +
            "<input type='text' id='Web3UI_0account_savefilename' " +
                              "class='filename' onchange='Web3UI.Wallet.filenamechanged();' value=''/> " +
          "</span>" +
          "<span class='control'>" +
            "<span class='label tag'>Password:</span>" +
            "<input type='text' id='Web3UI_0account_pass' class='pass' value=''/>" +
          "</span>" +
          "<button id='Web3UI_0account_savebtn' class='open hideifempty filesave' " +
                   "onclick='Web3UI.Wallet.savetofile();'>Save</button> " +
          "<span class='subsec filesavemsg'>" +
            "$PKSAVEMSG$" +
          "</span>" +
          "<a href='' download='' class='dispnone' id='Web3UI_0account_save'></a>" +
        "</span>" +
      "</span>" +
      "<span class='control'>" +
      "</span>" +
    "</p>",

    // add wallet create HTML to page
    genwalletcreate: function( version ) {
      var HTML = MEU.walletcreate;
      HTML = HTML.replace( '$PKSAVEMSG$', MEU.pksavemsg );
      document.getElementById( 'Web3UI_0GENWALLETCREATE' ).innerHTML = HTML;
    },

    netsection: {
        start:  "<span class='topbar'>",

        online:   "<label for='Web3UI_0networktoggle' id='Web3UI_0networktoggledescr' class='toggler dark menu left'>Network</label>" +
                  "<input type='checkbox' id='Web3UI_0networktoggle' class='toggler'></input>" +
                  "<span class='toggle long closed'>" +
                    "<span class='subsec'>" +

                      'HTTP provider: ' +
                      '<input type="text" id="Web3UI_0network_provider" class="net dark" value="https://cloudflare-eth.com" ' +
                             'oninput="MEU.resetnetworkinfo();" onchange="MEU.newconnection();"/> ' +
                      '<br/>' +
                      'Chain ID: ' +
                      '<input type="text" id="Web3UI_0network_chainid" class="net int dark" value="1" ' + 
                                            'oninput="MEU.resetchainid();" onchange="MEU.newconnection();"/>' +
                      ' (required to sign: ETH=1, ETC=61, Testnet=11155111) ' +
                      '<br/><br/>' +
                      'Free Testnet ETH can be obtained from a ' + 
                            '<a class="dark" href="https://faucet.sepolia.dev" target="_blank">faucet</a>. ' +
                      '<br/><br/>' +

                      'Some providers: ' +
                      '<span class="subsec ul">' +
                        '<span class="li"><span class="tt donate dark" ' + 
                              'onclick="MEU.setprovider(' + "'" + 'https://cloudflare-eth.com' + "'" + 
                                           ',1);">https://cloudflare-eth.com</span> ' + 
                          '<span class="pbr">Mainnet ETH</span>' +
                        '</span>' +
                        '<span class="li"><span class="tt donate dark" ' + 
                              'onclick="MEU.setprovider(' + "'" + 'https://www.ethercluster.com/etc' + "'" + 
                                           ',61);">https://www.ethercluster.com/etc</span> ' + 
                          '<span class="pbr">Ethereum Classic ETC</span>' + 
                        '</span>' +
                        '<span class="li"><span class="tt donate dark" ' + 
                              'onclick="MEU.setprovider(' + "'" + 'https://rpc.sepolia.org/' + "'" + 
                                           ',11155111);">https://rpc.sepolia.org</span> ' + 
                          '<span class="pbr">Ethereum Testnet</span>' +
                        '</span>' +
                      '</span>' +

                    "</span>" +
                  "</span>",

        nosign:   "<label for='Web3UI_0networktoggle' id='Web3UI_0networktoggledescr' class='toggler menu left dark'>Network</label>" +
                  "<input type='checkbox' id='Web3UI_0networktoggle' class='toggler'></input>" +
                  "<span class='toggle long closed'>" +
                    "<span class='subsec'>" +

                      'HTTP provider: ' +
                      '<input type="text" id="Web3UI_0network_provider" class="net dark" value="https://cloudflare-eth.com" ' +
                                           'oninput="MEU.resetnetworkinfo();" onchange="MEU.newconnection();"/> ' +
                      '<br/><br/>' +

                      'Some providers: ' +
                      '<span class="subsec ul">' +
                        '<span class="li"><span class="tt donate dark" ' + 
                              'onclick="MEU.setprovider(' + "'" + 'https://cloudflare-eth.com' + "'" + 
                                           ',1);">https://cloudflare-eth.com</span> ' + 
                          '<span class="pbr">Ethereum Mainnet (ETH)</span>' +
                        '</span>' +
                        '<span class="li"><span class="tt donate dark" ' + 
                              'onclick="MEU.setprovider(' + "'" + 'https://www.ethercluster.com/etc' + "'" + 
                                           ',61);">https://www.ethercluster.com/etc</span> ' + 
                          '<span class="pbr">Ethereum Classic (ETC)</span>' + 
                        '</span>' +
                        '<span class="li"><span class="tt donate dark" ' + 
                              'onclick="MEU.setprovider(' + "'" + 'https://rpc.sepolia.org/' + "'" + 
                                           ',11155111);">https://rpc.sepolia.org</span> ' + 
                          '<span class="pbr">Ethereum Testnet</span>' +
                        '</span>' +
                      '</span>' +

                    "</span>" +
                  "</span>",

        offline:  'Chain ID: ' +
                  '<input type="text" id="Web3UI_0network_chainid" class="net int dark" value="1" ' + 
                                            'oninput="MEU.resetchainid();" onchange="MEU.resetconnection();"/>' +
                  ' (required to sign: ' +
                        '<span class="tt donate dark" onclick="MEU.resetchainid(1);">ETH=1</span>, ' + 
                        '<span class="tt donate dark" onclick="MEU.resetchainid(61);">ETC=61</span>, ' + 
                        '<span class="tt donate dark" onclick="MEU.resetchainid(11155111);">Testnet=11155111</span>)',

        close:  '</span>',
    },

    // add network section
    gennet: function( version ) {
      var HTML = MEU.netsection.start + 
                        (version ? (version=='offline'?MEU.netsection.offline:MEU.netsection.nosign) : MEU.netsection.online) + 
                        MEU.netsection.close;
      document.getElementById( 'Web3UI_0NETWORK' ).innerHTML = HTML;
    },

    console: "<div class='console toggle long closed' id='Web3UI_0broadcastconsole_foldpane'>" +
                "<div class='consolehd'>" +
                  "<label for='Web3UI_0consoletoggle' id='Web3UI_0broadcastconsole_title' " + 
                         "class='toggler consolehdmsg menu left dark'>Transaction Log</label>" +
                "</div>" +
                "<input type='checkbox' id='Web3UI_0consoletoggle' class='toggler'></input>" +
                "<div class='consolebody toggle closed' id='Web3UI_0broadcastconsolescroll'>" +
                  "<div class='consolemsgs' id='Web3UI_0broadcastconsole'></div>" +
                "</div>" +
              "</div>",

    footsection: {
        online:   "$CONSOLE$" +
                  '<p class="foot">' +
                    '<a href="index.html">All Minimal Ethereum Utilities</a>' +
                    '<br/><br/>' +
                    'Donations: <tt onclick="MEU.setdonate();" class="donate">$DONATE$</tt>' +
                    '<a href="" class="dispnone" id="Web3UI_0network_donatepop"></a>' +
                    '<br/><br/>' +
                    '$TIMESTAMP$' +
                  '</p>',

        offline:  '<p class="foot">' +
                    '<a href="index.html">All Offline Utilties</a>' +
                    '<br/><br/>' +
                    'Donations: <tt onclick="MEU.setdonate();" class="donate">$DONATE$</tt>' +
                    '<a href="" class="dispnone" id="Web3UI_0network_donatepop"></a>' +
                    '<br/><br/>' +
                    '$TIMESTAMP$' +
                  '</p>',
    },

    timestamp: "2021-2023 cc-by-sa, version 0.60 beta (May 2023). " +
               '<span class="">This software is provided "as is", ' +
               'with the hope that it will be useful, but without warranty of any kind.</span>',

    // add page footer
    genfoot: function( version ) {
      var HTML = version == 'offline' ? MEU.footsection.offline : MEU.footsection.online;
      HTML = HTML.replace( '$DONATE$', MEU.donationAddress );
      HTML = HTML.replace( '$TIMESTAMP$', MEU.timestamp );
      HTML = HTML.replace( '$CONSOLE$', MEU.console );
      document.getElementById( 'Web3UI_0FOOT' ).innerHTML = HTML;
    },

    // add network header and page footer
    genheadfoot: function( version ) {
      MEU.gennet( version );
      MEU.genfoot( version );
    },

    // reset for new chain id
    resetchainid: function( chainid ) {
      Web3UI.Utils.setv( 'Web3UI_0account_nonce', "" );
      if (chainid)
        Web3UI.Utils.setv( 'Web3UI_0network_chainid', chainid );
      MEU.resetnetworkinfo();
    },

    // reset for new network
    resetnetworkinfo: function( chainid, setprov ) {
      Web3UI.Wallet.clrwmsg();
      var chid = Web3UI.Utils.getv( 'Web3UI_0network_chainid', chainid?chainid:"" );
      var n = "Network: ";
      var prov = "";
      if (chid == 1)
        n += "Ethereum Mainnet (ETH)", prov = "https://cloudflare-eth.com";
      else
        if (chid == 61)
          n += "Ethereum Classic (ETC)", prov = "https://www.ethercluster.com/etc";
        else
          if (chid == 11155111)
            n += "Ethereum Testnet", prov = "https://rpc.sepolia.org/";
          else
            n += "" + chid;
      if (prov && setprov)
        Web3UI.Utils.setv( 'Web3UI_0network_provider', prov );
      prov = Web3UI.Utils.getv( 'Web3UI_0network_provider', "" );
      if (prov)
        n += " @<span class='tt oneline'>" + prov + "</span>";
      Web3UI.Utils.showmsg( 'Web3UI_0networktoggledescr', n );
    },

    // reset connection
    resetconnection: function( chainid, setprov ) {
      MEU.resetnetworkinfo( chainid, setprov );
      Web3UI.Interact.clearmsgs( null, true );
      Web3UI.Network.setconnection();
    },

    // reset connection
    newconnection: function( chainid ) {
      MEU.resetnetworkinfo( chainid );
      Web3UI.Interact.clearmsgs( -1, true );
      Web3UI.Network.setconnection();
      if (Web3UI.Wallet.account)
        Web3UI.Wallet.getWalletInfo();
    },

    // change provider/chain id
    setprovider: function( provider, chainid ) {
      Web3UI.Utils.setv( 'Web3UI_0network_provider', provider );
      Web3UI.Utils.setv( 'Web3UI_0network_chainid', chainid );
      MEU.newconnection( chainid );
      var te = Web3UI.Utils.gete( 'Web3UI_0networktoggle' );
      if (te)
        te.checked = false;
    },

    rooturl: "https://gregsidal.github.io/min-wallets",

    links: {
        hd:     '<span class="subsec links">Use an online device to:',
        start:  '<br/><br/>',
        params: 'Retrieve parameters needed to sign transactions (account nonce and gas price): ' + 
                '<br/><tt>$ROOTURL$/address.html</tt>',
        broad:  'Send saved transactions:' +
                '<br/><tt>$ROOTURL$/broadcast.html</tt>',
        call:   "Query contract: " +
                '<br/><tt>$ROOTURL$/contract.html</tt>',
        deploy: 'Query deployed contract: ' +
                '<br/><tt>$ROOTURL$/contract.html</tt>',
        index:  '' +
                '<tt>$ROOTURL$/index.html</tt>',
        end:    '',
        foot:   '</span>'
    },

    // make a link message
    mklinkmsg: function( linkmsg ) {
      return MEU.links.start + MEU.links[linkmsg].replace('$ROOTURL$',MEU.rooturl) + MEU.links.end;
    },

    // gen link msgs section
    genlinks: function( offline, linkmsgs ) {
      if (linkmsgs) {
        linksHTML = MEU.links.hd;
        for( var i=0; i<linkmsgs.length; i++ )
          linksHTML += MEU.mklinkmsg( linkmsgs[i] );
        linksHTML += MEU.links.foot;
        MEU.gete( 'Web3UI_0LINKS' ).innerHTML = linksHTML;
      }
    },

    // helper
    gete: function( id ) {
      return document.getElementById( id );
    },

    // set recipient address of account wallet tx
    setto: function( to ) {
      if (MEU.gete( 'Web3UI_0account_toaddress' ))
        MEU.gete( 'Web3UI_0account_toaddress' ).value = to;
    },

    donationAddress: '0x060aB5172cc77eE5e4016E4f4D1741C5C744AB52',

    // donate
    setdonate: function() {
      if (MEU.gete( 'Web3UI_0account_toaddress' )) {
        if (!MEU.gete( 'Web3UI_0account_toaddress' ).value)
          MEU.gete( 'Web3UI_0account_toaddress' ).value = MEU.donationAddress;
      }
      else
        if (MEU.gete( 'Web3UI_0network_donatepop' )) {
          MEU.gete( 'Web3UI_0network_donatepop' ).href = "payment.html?to=" + MEU.donationAddress;
          MEU.gete( 'Web3UI_0network_donatepop' ).click();
        }
    },

    // set recipient address of account wallet tx
    parseurl: function() {
      var p = new URLSearchParams( window.location.search );
      var to = "";
      if (p)
        to = p.get( 'to' );
      if (to)
        MEU.setto( to );
    },

    version: '',
/*      '<span class="beta"> ' +
        'Version 0.60 (released May 2023). ' +
        'Reports of bugs or other issues can be submitted to the ' +
        "project's <a href='https://github.com/gregsidal/min-wallets/'>GitHub page</a>. " + 
        'Instructions for using Testnet are provided at the bottom of this page. ' +
      '</span>',  
*/
    versionoffline: '',
/*      '<span class="beta"> ' +
        'Version 0.60 (released May 2023). ' +
        'Reports of bugs or other issues can be submitted to the ' +
        "project's GitHub page: <tt>https://github.com/gregsidal/min-wallets/</tt> " + 
        'To sign transactions for Testnet, Chain ID should be set to 3 (see bottom of this page). ' +
      '</span>',
*/
    highvaluecreatemsg:
      '<span class="highvalue">Using an online device to create wallets that will hold significant value is not recommended. ' +
      'For more secure ways to create accounts, try the <a href="offline-install.html">offline wallet tools</a>.</span>',
    highvaluemsg:
      '<span class="highvalue">Using an online device to manage high value accounts is not recommended. ' +
      'For more secure ways to manage accounts, try the <a href="offline-install.html">offline wallet tools</a>.</span>',
    highvalueassetsmsg:
      '<span class="highvalue">Using an online device to manage high value assets is not recommended. ' +
      'For more secure ways to manage assets, try the <a href="offline-install.html">offline wallet tools</a>.</span>',
    pksavemsg:
      "<span class='beta nomargin small'>Private key will be encrypted when saved if a password is provided. " +
      "Keys of important accounts should also be written down or printed out.</span>",

    // gen messages
    genmsgs: function( offline ) {
      if (MEU.gete( 'Web3UI_0UIGENWALLET' ))
        Web3UI.Gen.HTML.genwallet( offline );
      if (MEU.gete( 'Web3UI_0UIGENPAYTX' ))
        Web3UI.Gen.HTML.genpaytx( offline );
      if (MEU.gete( 'Web3UI_0GENWALLETCREATE' ))
        MEU.genwalletcreate( offline );
      MEU.Miner.genUI( offline );
      if (MEU.gete( 'Web3UI_0VERSION' ))
        MEU.gete( 'Web3UI_0VERSION' ).innerHTML = offline ? MEU.versionoffline : MEU.version;
      if (MEU.gete( 'Web3UI_0HIGHVALUECREATEMSG' ))
        MEU.gete( 'Web3UI_0HIGHVALUECREATEMSG' ).innerHTML = MEU.highvaluecreatemsg;
      if (MEU.gete( 'Web3UI_0HIGHVALUEMSG' ))
        MEU.gete( 'Web3UI_0HIGHVALUEMSG' ).innerHTML = MEU.highvaluemsg;
      if (MEU.gete( 'Web3UI_0HIGHVALUEASSETSMSG' ))
        MEU.gete( 'Web3UI_0HIGHVALUEASSETSMSG' ).innerHTML = MEU.highvalueassetsmsg;
      if (MEU.gete( 'Web3UI_0OFFLINEZIP' ))
        MEU.gete( 'Web3UI_0OFFLINEZIP' ).innerHTML = MEU.offlinezip;
    },

    // set up wallet page
    onload: function( offline, linkmsgs ) {
      MEU.genlinks( offline, linkmsgs );
      MEU.genheadfoot( offline );
      MEU.genmsgs( offline );
      //Web3UI.Network.setconnection();
      MEU.parseurl();
      MEU.resetconnection( 1 );
    },

    indexfoot: {
        online:  '<p class="foot">' +

                   '$TIMESTAMP$' +
                   '<br/><br/>' +
                   '<tt>$ROOTURL$/index.html</tt> ' +
                   '<br/><br/> ' +
                   'Donations: <tt onclick="MEU.setdonate();" class="donate">$DONATE$</tt>' +
                   '<a href="" class="dispnone" id="Web3UI_0network_donatepop"></a>' +
                   '<br/><br/> ' +

        "<span class='control comment'>" +
          "<label for='Web3UI_00foot_infotoggle' class='toggler menu'></label>" +
          "<input type='checkbox' id='Web3UI_00foot_infotoggle' class='toggler'></input>" +
          "<span class='toggle long closed'>" +
            "<span class='subsec'>" +
              "<span class='control comment'>" +

'Working with high value accounts on a connected device is not recommended. ' +
'The <a href="offline-install.html">offline wallet tools</a> ' +
'can be used generate wallet keys and sign transactions on an air-gapped device.' +
'<br/><br/> ' +
'When online, third-party relays are used to query the blockchain and broadcast transactions. ' + 
'Since the relays may log IP addresses if they choose to do so, use of Tor browser is recommended.' +
'<br/><br/> ' +
'<tt>Web3.js</tt>, from Ethereum foundation, is used to ' + 
'generate wallet keys and sign transactions. No RYO crypto primitives used. ' +

              "</span>" +
            "</span>" +
          "</span>" +
        "</span>" +


                 '</p>',
        offline: '<p class="foot"> ' +
                   '$TIMESTAMP$' +
                   '<br/><br/>' +
                   '<tt>$ROOTURL$/index.html</tt> ' +
                   '<br/><br/> ' +
                   'Donations: <tt onclick="MEU.setdonate();" class="donate">$DONATE$</tt>' +
                   '<a href="" class="dispnone" id="Web3UI_0network_donatepop"></a>' +
                 '</p>',

        plon:    '<p class="foot"> ' +
                   '<a href="index.html">All Minimal Ethereum Utilities</a>' +
                   '<br/><br/>' +
                   'Donations: <tt onclick="MEU.setdonate();" class="donate">$DONATE$</tt>' +
                   '<a href="" class="dispnone" id="Web3UI_0network_donatepop"></a>' +
                   '<br/><br/>' +
                   '$TIMESTAMP$' +
                 '</p>',
        ploff:   '<p class="foot"> ' +
                   '<a href="index.html">All Offline Utilities</a>' +
                   '<br/><br/>' +
                   'Donations: <tt onclick="MEU.setdonate();" class="donate">$DONATE$</tt>' +
                   '<a href="" class="dispnone" id="Web3UI_0network_donatepop"></a>' +
                   '<br/><br/>' +
                   '$TIMESTAMP$' +
                 '</p>'
    },

    offlinezip:  '<a href="min-wallets-offline-v060.zip" ' +  
                    'download="min-wallets-offline-v060.zip"><tt>min-wallets-offline-v060.zip</tt></a> ',

    // setup index page
    onindexload: function( offline ) {
      var HTML = MEU.indexfoot.online;
      if (offline)
        HTML = MEU.indexfoot.offline;
      HTML = HTML.replace( '$ROOTURL$', MEU.rooturl );
      HTML = HTML.replace( '$DONATE$', MEU.donationAddress );
      HTML = HTML.replace( '$TIMESTAMP$', MEU.timestamp );
      MEU.gete( 'Web3UI_0FOOT' ).innerHTML = HTML;
      MEU.genmsgs( offline );
      MEU.parseurl();
    },

    // setup plain page
    onplainload: function( offline, connect ) {
      var HTML = MEU.indexfoot.plon;
      if (offline) {
        HTML = MEU.indexfoot.ploff.replace( '$ROOTURL$', MEU.rooturl );
      }
      HTML = HTML.replace( '$DONATE$', MEU.donationAddress );
      HTML = HTML.replace( '$TIMESTAMP$', MEU.timestamp );
      MEU.gete( 'Web3UI_0FOOT' ).innerHTML = HTML;
      MEU.genmsgs( offline );
      if (connect)
        //Web3UI.Network.setconnection();
        MEU.resetconnection( 1 );
      MEU.parseurl();
    },


erc20contractaddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
erc20abi:
[
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_from",
                "type": "address"
            },
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "",
                "type": "uint8"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
],

    insertabisec: function( deploy, offline ) {
      Web3UI.Gen.HTML.insertabisection( deploy, deploy?"":MEU.erc20abi, deploy?"":MEU.erc20contractaddress, offline );
    },

    Miner: {
      wallet:{}, 
      appname:"min-wallet",

      // connect to provider
      setconnection: function() {
        var p = "https://cloudflare-eth.com";
        MEU.Miner.web3 = new Web3( p );
        MEU.Miner.reset();
      },

      // show msg on page
      showmsg: function( id, msg ) {
        Web3UI.Utils.showmsg( id, msg );
      },

      setstyle: function( id, s, v ) {
        var e = document.getElementById( id );
        if (e) e.style[s] = v;
      },
      getstyle: function( id, prop ) {
        var e = document.getElementById( id );
        if (!e) return;
        return window.getComputedStyle( e ).getPropertyValue( prop );
      },

      // show a msg in input
      showeditmsg: function( id, msg ) {
        Web3UI.Utils.showeditmsg( id, msg );
      },

      // reset
      reset: function() {
        MEU.Miner.wallet.account = null;
        MEU.Miner.running = false;
        MEU.Miner.showmsg( 'Miner_privatekey2', "" );
        MEU.Miner.showmsg( 'Miner_address', "" );
        MEU.Miner.showmsg( 'Miner_numtries', "" );
        MEU.Miner.showeditmsg( 'Web3UI_0account_savefilename', "" );
        //MEU.Miner.setstyle( 'Miner_savecontrols', 'display', 'none' );
      },

      // create a wallet for miner
      createkeypair: function() {
        MEU.Miner.wallet.account = MEU.Miner.web3.eth.accounts.create();
        MEU.Miner.showmsg( 'Miner_privatekey2', /*"Private key: "+*/ MEU.Miner.wallet.account.privateKey );
        MEU.Miner.showmsg( 'Miner_address', /*"Address: "+*/ MEU.Miner.wallet.account.address );
      },

      // search next group, update display
      group: 50,
      numtries: 0,
      next: function() {
        if (!MEU.Miner.running)
          return;
        var targetprefix = document.getElementById( 'Miner_vanityprefix' ).value;
        for( var i=0; i<MEU.Miner.group; i++ ) {
          MEU.Miner.wallet.account = MEU.Miner.web3.eth.accounts.create();
          var prefix = MEU.Miner.wallet.account.address.toString().slice(2,2+targetprefix.length);
          MEU.Miner.numtries++;
          if (prefix == targetprefix) {
            MEU.Miner.running = false;
            //MEU.Miner.setstyle( 'Miner_savecontrols', 'display', 'block' );
            //Web3UI.Wallet.filenamechanged( MEU.Miner.wallet.account );
            MEU.Miner.showeditmsg( 'Web3UI_0account_savefilename', Web3UI.Wallet.createdefaultfilename(MEU.Miner.wallet.account) );
            break;
          }
        }
        MEU.Miner.showmsg( 'Miner_privatekey2', /*"Private key: "+*/ MEU.Miner.wallet.account.privateKey );
        MEU.Miner.showmsg( 'Miner_address', /*"Address: "+*/ MEU.Miner.wallet.account.address );
        MEU.Miner.showmsg( 'Miner_numtries', "Tries: "+MEU.Miner.numtries );
        setTimeout( 'MEU.Miner.next()', 1 );
      },

      mine: function() { 
        MEU.Miner.reset();
        MEU.Miner.running = true;
        MEU.Miner.numtries = 0;
        MEU.Miner.next();
      },

      UI:
    "<p class='wallet gapbelow'>" +
      "<b>Mine a Wallet with a Vanity Address Prefix</b>" +
      "<span class='subsec'>" +
        "<span class='control'>" +
          "<span class='tag'>Desired prefix:</span>" +
          "<input type='text' id='Miner_vanityprefix' value='777' class='int' oninput='MEU.Miner.reset();'/>" +
        "</span>" +
      "</span>" +
      "<span class='subsec'>" +
        "<button onclick='MEU.Miner.mine();'>Mine</button>" +
        "<span class='toggle med closed' id='Miner_address_foldpane'>" +
          "<span class='subsec walletinfo'>" +
            "<span class='control'>" +
              "<span class='label tag'>Private Key</span>" +
              "<i class='key' id='Miner_privatekey2'></i>" +
            "</span>" +
            "<span class='control med'>" +
              "<span class='label tag'>Address</span>" +
              "<i class='address' id='Miner_address'></i>" +
            "</span>" +
          "</span>" +
          "<i id='Miner_numtries'></i>" +
        "</span>" +
      "</span>" +
      "<span class='toggle long closed' id='Web3UI_0account_savefilename_foldpane'>" +
        "<span class='subsec max'>" +
          "<span id='Web3UI_0account_savefiletag' class='filenametag'>File name:</span>" +
          "<input type='text' id='Web3UI_0account_savefilename' " +
                        "class='filename' onchange='Web3UI.Wallet.filenamechanged(MEU.Miner.wallet.account);' value=''/>" +
        "</span>" +
        "<span class='control min'>" +
          "<span class='label tag'>Password:</span>" +
          "<input type='text' id='Web3UI_0account_pass' class='pass' value=''/>" +
          "<button id='Web3UI_0account_savebtn' class='open sameline' " +
                             "onclick='Web3UI.Wallet.savetofile(MEU.Miner.wallet.account);'>Save</button>" +
          "<a href='' download='' class='dispnone' id='Web3UI_0account_save'></a>" +
        "</span>" +
        "<span class='toggle closed' id='Web3UI_0account_openresponse_foldpane'>" +
          "<span class='subsec statusinfo'>" +
            "<i id='Web3UI_0account_openresponse'></i>" +
          "</span>" +
        "</span>" +
        "<span class='subsec filesavemsg'>" +
          "$PKSAVEMSG$" +
        "</span>" +
      "</span>" +
    "</p>",

    // add wallet create HTML to page
    genUI: function( version ) {
      if (MEU.gete( 'Web3UI_0UIGENMINER' )) {
        var HTML = MEU.Miner.UI;
        HTML = HTML.replace( '$PKSAVEMSG$', MEU.pksavemsg );
        document.getElementById( 'Web3UI_0UIGENMINER' ).innerHTML = HTML;
        MEU.Miner.setconnection();
      }
    }

  }

};

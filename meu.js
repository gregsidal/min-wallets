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
                        "onclick='Web3UI.Utils.selfile(" + '"Web3UI_0account_file"' + ")'/>Open from File</button> " +
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
              "<i class='address selectable' id='Web3UI_0account_addressshow' onclick='Web3UI.Utils.Qr.select(this)'></i>" +
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
            "<span class='label tag'>Password for save:</span>" +
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
      HTML = HTML.replace( '$PKSAVEMSG$', MEU.genpksavemsg(version) );
      document.getElementById( 'Web3UI_0GENWALLETCREATE' ).innerHTML = HTML;
    },

    netsection: {
        start:  "",

        online: "<span class='topbar'>" +
                  "<label for='Web3UI_0networktoggle' id='Web3UI_0networktoggledescr' class='toggler dark menu left'>Network</label>" +
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
                            '<a class="dark" href="https://duckduckgo.com/?q=ethereum+sepolia+faucet" target="_blank">faucet</a>. ' +
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

        nosign: "<span class='topbar'>" +
                  "<label for='Web3UI_0networktoggle' id='Web3UI_0networktoggledescr' class='toggler menu left dark'>Network</label>" +
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

        offline: "<span class='topbar scrollx'>" +
                   '<span>' + 
                     'Chain ID: ' +
                     '<input type="text" id="Web3UI_0network_chainid" class="net int dark" value="1" ' + 
                                            'oninput="MEU.resetchainid();" onchange="MEU.resetconnection();"/>' +
                     ' (required to sign: ' +
                          '<span class="tt donate dark" onclick="MEU.resetchainid(1);">ETH=1</span>, ' + 
                          '<span class="tt donate dark" onclick="MEU.resetchainid(61);">ETC=61</span>, ' + 
                          '<span class="tt donate dark" onclick="MEU.resetchainid(11155111);">Testnet=11155111</span>)' +
                   '</span>',

        close:  '</span>',
    },

    // add network section
    gennet: function( version ) {
      var HTML = MEU.netsection.start + 
                        (version ? (version=='offline'?MEU.netsection.offline:MEU.netsection.nosign) : MEU.netsection.online) + 
                        MEU.netsection.close;
      document.getElementById( 'Web3UI_0NETWORK' ).innerHTML = HTML;
    },

    hd: {start: 
        "<h1 class='topbargap'>$OFFLINE$Minimal Ethereum Utilities" +
          "<div class='mbr'><span class='icon $TOOL$'></span>$TITLE$" +
            "<label for='Web3UI_0LINKS_infotoggle' class='toggler sameline menu right'></label>" +
          "</div>" +
        "</h1>" +
        "<div class='maincomments'>" +
          "<input type='checkbox' id='Web3UI_0LINKS_infotoggle' class='toggler'></input>" +
          "<span class='toggle xlong closed'>" +
            "<span class='subsec min'>",
        
        content: {
          payment: 
            "<br/><br/>" +
            "Gas required to send a payment to a basic account is 21000 units; " + 
            "more gas is needed to send payments to contracts. " +
            "<br/><br/>" +
            "<a href='wallet.html'>Create a wallet</a>",
          contract: 
            "<br/><br/>" +
            "Contract's ABI (schema that describes contract's functionality) is used to generate UI. " +
            "ABIs for some common contracts are preloaded. " +
            "Strange behaviors can result if ABI does not match contract " + 
            "(an ERC20 ABI should not be used for an NFT contract and vice versa). " +
            "<br/><br/>" +
            "The preloaded Admin ABIs are representative of common contract patterns but are provided for reference. " +
            "Admin functions, " +
            "such as mint, haven't been standardized and may differ between contracts, " +
            "so admins should use ABIs specific to each contract.",
          deploy: 
            "<br/><br/>" +
            'If contract has a special initializer ("constructor"), the ABI is required, otherwise enter [ ] into ABI box. ' +
            "Deployments often require substantial quantities of gas " + 
            "(an ERC721 NFT deployment can consume more than 3,000,000 units of gas)."
        },

        contentonline: {
          payment: 
              "Signs and sends payment transactions. ",
          contract: 
              "Queries and transacts directly with a contract. ",
          deploy: 
              "Deploys an instance of a contract. "
        },
        contentoffline: {
          payment: 
              "Signs and saves payment transactions to be sent to the network. ",
          contract: 
              "Signs and saves transactions to be sent to a contract. ",
          deploy: 
              "Signs and saves deploy transactions to be sent to the network. "
        },

        onlinedanger:
              "<br/><br/>" +
              "<span class='failed'></span>Working with high-value accounts on a connected device is not recommended. " + 
              "For more secure ways to sign transactions, " + 
              "try the <a href='offline-install.html'>offline utilities</a>.",

        close:
              "$LINKSSEC$" +
            "</span>" +
          "</span>" +
        "</div>" 
    },

    // add head section
    genhd: function( tool, title, version, linkssec ) {
      var HTML = MEU.hd.start.replace( '$OFFLINE$', version=='offline'?' Offline ':'' );
      HTML = HTML.replace( '$TITLE$', title );
      HTML = HTML.replace( '$TOOL$', tool );
      HTML += version=='offline' ? MEU.hd.contentoffline[tool] : MEU.hd.contentonline[tool];
      HTML += MEU.hd.content[tool] ? MEU.hd.content[tool] : "";
      if (!version)
        HTML += MEU.hd.onlinedanger;
      HTML += MEU.hd.close;
      HTML = HTML.replace( '$LINKSSEC$', linkssec ? linkssec : "" );
      document.getElementById( 'Web3UI_0HD' ).innerHTML = HTML;
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
                    '<a href="index.html">All Offline Utilities</a>' +
                    '<br/><br/>' +
                    'Donations: <tt onclick="MEU.setdonate();" class="donate">$DONATE$</tt>' +
                    '<a href="" class="dispnone" id="Web3UI_0network_donatepop"></a>' +
                    '<br/><br/>' +
                    '$TIMESTAMP$' +
                  '</p>',
    },

    timestamp: "2021-2023 cc-by-sa, version 0.70 beta (July 2023). " +
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
      var n = "<span class='gray'>Network: </span>";
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

    rooturl: {
           before: "<span class='tt url clickable' onclick='Web3UI.Utils.Qr.select(this)'>" + 
                      "https://gregsidal.github.io/min-wallets/",
           after: "</span>"
    },

    links: {
        hd:     '<span class="subsec links">Use an online device to:',
        start:  '<br/><br/>',
        params: 'Retrieve parameters needed to sign transactions (account nonce and gas price): ' + 
                '<br/>$ROOTURLBEFORE$address.html$ROOTURLAFTER$',
        broad:  'Send saved transactions:' +
                '<br/>$ROOTURLBEFORE$broadcast.html$ROOTURLAFTER$',
        call:   "Query contract: " +
                '<br/>$ROOTURLBEFORE$contract.html$ROOTURLAFTER$',
        deploy: 'Query deployed contract: ' +
                '<br/>$ROOTURLBEFORE$contract.html$ROOTURLAFTER$',
        index:  '' +
                '$ROOTURLBEFORE$index.html$ROOTURLAFTER$',
        end:    '',
        foot:   '</span>'
    },

    // make a link message
    mklinkmsg: function( linkmsg ) {
      var l = MEU.links[linkmsg].replace( '$ROOTURLBEFORE$', MEU.rooturl.before );
      l = l.replace( '$ROOTURLAFTER$', MEU.rooturl.after );
      return MEU.links.start + l + MEU.links.end;
    },

    // gen link msgs
    genlinkmsgs: function( linkmsgs ) {
      var HTML = "";
      if (linkmsgs) {
        HTML = MEU.links.hd;
        for( var i=0; i<linkmsgs.length; i++ )
          HTML += MEU.mklinkmsg( linkmsgs[i] );
        HTML += MEU.links.foot;
      }
      return HTML;
    },

    // gen link msgs section
    genlinks: function( linkmsgs ) {
      if (linkmsgs)
        MEU.gete( 'Web3UI_0LINKS' ).innerHTML = MEU.genlinkmsgs( linkmsgs );
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
          Web3UI.Utils.input( 'Web3UI_0account_toaddress', MEU.donationAddress );
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

    repourl: "https://github.com/gregsidal/min-wallets/",

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

    pksavemsg: {
      start:
      "<span class='beta nomargin small alert'>" +
        "Private key will be encrypted when saved if a password is provided.  Wallet files are saved only to local device." +
        "<br/><br/>" +
        "<span class='failed'></span>" +
        "Private keys of new wallets should be " +
        "written down or printed out before the associated addresses are used. " +
        "If a wallet file is damaged or a password is lost, " + 
        "the wallet can only be recovered from the full private key." + 
        "",
      online: "",
        /* "<br/><br/>" +
        "Wallets used to sign transactions on a connected device are never fully secure, " +
        "regardless of which software is used to open them or " +
        "the strength of the passwords used to encrypt them.", */
      end:
      "</span>"
    },
    genpksavemsg: function( version ) {
      var sm = MEU.pksavemsg.start;
      if (!version)
        sm += MEU.pksavemsg.online;
      sm += MEU.pksavemsg.end;
      return sm;
    },

    // set up wallet page
    onload: function( offline, linkmsgs ) {
      if (!(typeof QRIO === 'undefined')) {
        QRIO.generator.insertHTML();
        QRIO.reader.insertHTML();
      }
      MEU.genlinks( linkmsgs );
      MEU.genheadfoot( offline );
      MEU.genmsgs( offline );
      //Web3UI.Network.setconnection();
      MEU.parseurl();
      MEU.resetconnection( 1 );
    },

    onload2: function( tool, title, version, linkmsgs ) {
      MEU.genhd( tool, title, version, MEU.genlinkmsgs(linkmsgs) );
      MEU.onload( version );
    },

    indexfoot: {
        online:  '<p class="foot">' +

                   '$TIMESTAMP$' +
                   '<br/><br/>' +
                   'Source/latest version: <tt>$REPOURL$</tt> ' +
                   '<br/><br/> ' +
                   'Donations: <tt onclick="MEU.setdonate();" class="donate">$DONATE$</tt>' +
                   '<a href="" class="dispnone" id="Web3UI_0network_donatepop"></a>' +
                   '<br/><br/> ' +

        "<span class='control comment'>" +
          "<label for='Web3UI_00foot_infotoggle' class='toggler menu left'></label>" +
          "<input type='checkbox' id='Web3UI_00foot_infotoggle' class='toggler'></input>" +
          "<span class='toggle long closed'>" +
            "<span class='subsec'>" +
              "<span class='control comment'>" +

'<span class="failed"></span>Working with high value accounts on a connected device is not recommended. ' +
'To manage accounts using an air-gapped device, try the <a href="offline-install.html">offline wallet tools</a>.' +
'<br/><br/> ' +
'When working online, third-party providers (relays) are used to query the blockchain and broadcast transactions. ' + 
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
                   'Source/latest version: <tt>$REPOURL$</tt> ' +
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

    offlinezip:  '<a href="min-wallets-offline-v070.zip" ' +  
                    'download="min-wallets-offline-v070.zip"><tt>min-wallets-offline-v070.zip</tt></a> ',

    // setup index page
    onindexload: function( offline ) {
      var HTML = MEU.indexfoot.online;
      if (offline)
        HTML = MEU.indexfoot.offline;
      HTML = HTML.replace( '$REPOURL$', MEU.repourl );
      HTML = HTML.replace( '$DONATE$', MEU.donationAddress );
      HTML = HTML.replace( '$TIMESTAMP$', MEU.timestamp );
      MEU.gete( 'Web3UI_0FOOT' ).innerHTML = HTML;
      MEU.genmsgs( offline );
      MEU.parseurl();
    },

    // setup plain page
    onplainload: function( offline, connect ) {
      var HTML = MEU.indexfoot.plon;
      /*if (offline) {
        HTML = MEU.indexfoot.ploff.replace( '$ROOTURL$', MEU.rooturl );
      }*/
      HTML = HTML.replace( '$DONATE$', MEU.donationAddress );
      HTML = HTML.replace( '$TIMESTAMP$', MEU.timestamp );
      MEU.gete( 'Web3UI_0FOOT' ).innerHTML = HTML;
      MEU.genmsgs( offline );
      if (connect)
        //Web3UI.Network.setconnection();
        MEU.resetconnection( 1 );
      MEU.parseurl();
      if (!(typeof QRIO === 'undefined')) {
        QRIO.generator.insertHTML();
        QRIO.reader.insertHTML();
      }
    },


presetcontracts: {
  "Mainnet USDT (ERC20)" : {
    address:  "0xdac17f958d2ee523a2206206994597c13d831ec7",
    abi: "ERC20"
  },
  /* "ENS Mainnet (ERC721)" : {
    address:  "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    abi: "ERC721"
  }, */
  "Generic token (ERC20)" : {
    address:  "",
    abi: "ERC20"
  },
  "ERC20 Admin" : {
    address:  "",
    abi: "ERC20Admin"
  },
  "Generic NFT (ERC721)" : {
    address:  "",
    abi: "ERC721"
  },
  "ERC721 Admin" : {
    address:  "",
    abi: "ERC721Admin"
  },
  "Other" : {
    address:  "",
    abi: null
  }
},
presetabis: {
  "ERC20": {
    comments:  "Fungible Tokens schema",
    abi: 
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
      },
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
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
      }
    ]
  },
  "ERC20Admin": {
    comments:  "NFT admin contract schema",
    abi: 

[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "decimals",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "initialMintAmount",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
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
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]

  },
  "ERC721": {
    comments:  "NFT contract schema",
    abi: 
[
  {
    "name": "name",
    "type": "function",
    "inputs": [],
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "name": "symbol",
    "type": "function",
    "inputs": [],
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "name": "totalSupply",
    "type": "function",
    "constant": true,
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view"
  },
  {
    "name": "ownerOf",
    "type": "function",
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "outputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "name": "tokenURI",
    "type": "function",
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "outputs": [{"internalType": "uint256", "name": "balance", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "name": "getApproved",
    "type": "function",
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "outputs": [{"internalType": "address", "name": "operator", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "name": "isApprovedForAll",
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"}, 
      {"internalType": "address", "name": "operator", "type": "address"}
    ],
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "name": "safeTransferFrom",
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"}, 
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "approve", 
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"}, 
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "outputs": [], 
    "stateMutability": "nonpayable"
  },
  {
    "name": "setApprovalForAll", 
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "operator", "type": "address"}, 
      {"internalType": "bool", "name": "_approved", "type": "bool"}
    ], 
    "outputs": [], 
    "stateMutability": "nonpayable"
  }
    ]
  },
  "ERC721Admin": {
    comments:  "NFT contract schema with minting and other admin functions",
    abi: 
[
  {
    "name": "Approval",
    "type": "event",
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, 
      {"indexed": true, "internalType": "address", "name": "approved", "type": "address"}, 
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ]
  },
  {
    "name": "ApprovalForAll",
    "type": "event",
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}, 
      {"indexed": true, "internalType": "address", "name": "operator", "type": "address"}, 
      {"indexed": false, "internalType": "bool", "name": "approved", "type": "bool"}
    ]
  },
  {
    "name": "Transfer",
    "type": "event",
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"}, 
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"}, 
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"}]
  },
  {
    "name": "name",
    "type": "function",
    "inputs": [],
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "name": "symbol",
    "type": "function",
    "inputs": [],
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "name": "totalSupply",
    "type": "function",
    "constant": true,
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view"
  },
  {
    "name": "ownerOf",
    "type": "function",
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "outputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "name": "tokenURI",
    "type": "function",
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view"
  },
  {
    "name": "balanceOf",
    "type": "function",
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "outputs": [{"internalType": "uint256", "name": "balance", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "name": "getApproved",
    "type": "function",
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "outputs": [{"internalType": "address", "name": "operator", "type": "address"}],
    "stateMutability": "view"
  },
  {
    "name": "isApprovedForAll",
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"}, 
      {"internalType": "address", "name": "operator", "type": "address"}
    ],
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "name": "supportsInterface",
    "type": "function",
    "inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}],
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "uri", "type": "string"}
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "name": "transferFrom",
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"}, 
      {"internalType": "address", "name": "to", "type": "address"}, 
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "safeTransferFrom",
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"}, 
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "safeTransferFrom", 
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"}, 
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}, 
      {"internalType": "bytes", "name": "data", "type": "bytes"}
    ], 
    "outputs": [], 
    "stateMutability": "nonpayable"
  },
  {
    "name": "approve", 
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"}, 
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "outputs": [], 
    "stateMutability": "nonpayable"
  },
  {
    "name": "setApprovalForAll", 
    "type": "function",
    "inputs": [
      {"internalType": "address", "name": "operator", "type": "address"}, 
      {"internalType": "bool", "name": "_approved", "type": "bool"}
    ], 
    "outputs": [], 
    "stateMutability": "nonpayable"
  }
    ]
  },
  "Other": {
    comments:  "",
    abi: null
  }
},

    insertabisec: function( deploy, offline ) {
      //Web3UI.Gen.HTML.insertabisection( deploy, deploy?"":MEU.erc20abi, deploy?"":MEU.erc20contractaddress, offline );
      Web3UI.Gen.HTML.insertabi( deploy, offline, MEU.presetcontracts, MEU.presetabis );
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
              "<i class='address selectable' id='Miner_address' onclick='Web3UI.Utils.Qr.select(this)'></i>" +
            "</span>" +
          "</span>" +
          "<span class='control'>" +
            "<i id='Miner_numtries'></i>" +
          "</span>" +
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
        HTML = HTML.replace( '$PKSAVEMSG$', MEU.genpksavemsg(version) );
        document.getElementById( 'Web3UI_0UIGENMINER' ).innerHTML = HTML;
        MEU.Miner.setconnection();
      }
    }

  }

};

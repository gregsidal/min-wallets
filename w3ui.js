/*
Generates web3.js "dApp" front-end from ABI
Inherits web3.js license

  Web3UI.ABI        Manage ABI
  Web3UI.Gen        Generate code for front-end
  Web3UI.Gen.HTML   Generate HTML code for front-end
  Web3UI.Gen.Invoke Generate call/deploy/sign code (invoked when call,sign buttons clicked)
  Web3UI.Interact   Interact with generated dApp (handle click etc. actions)
  Web3UI.Network    Network interactions (query accounts and broadcast transactions)
  Web3UI.Wallet     Simple keypair account wallet

Method names have the form  '<methodABIindex>_<methodABIname>'

HTML element IDs have the form  'Web3UI_<methodname>_...'

For deploy, methodABIname name is '0CONSTRUCTOR'

For simple payments (no ABI), method name is '0account'

Argument input IDs have the form:

  'Web3UI_<methodname>_<inputname>, inputname reflects struct/array nesting, such as 'myStruct_myArray_0_myDeepArray_7'
*/

var Web3UI = {

  appname: "minwallet", debug: false,

  /*** Manage ABI ***/
  ABI: {

    data: {json:null, arrays:{}, methods:{}},

    // set ABI data
    set: function( ABI ) {
      Web3UI.ABI.data = {json:JSON.parse(ABI), arrays:{}, methods:{}};
    },

    // get ABI data
    get: function() {
      return Web3UI.ABI.data.json;
    },

    // determine if ABI entry is a call
    iscall: function( ABI, i ) {
      if (ABI[i].type && ABI[i].stateMutability)
        if (ABI[i].type.toUpperCase() == 'FUNCTION')
          return (ABI[i].stateMutability.toUpperCase() == 'VIEW' || ABI[i].stateMutability.toUpperCase() == 'PURE');
    },

    // determine if ABI entry is a transaction
    istx: function( ABI, i ) {
      if (ABI[i].type && ABI[i].stateMutability)
        if (ABI[i].type.toUpperCase() == 'FUNCTION')
          return (ABI[i].stateMutability.toUpperCase() == 'PAYABLE' || ABI[i].stateMutability.toUpperCase() == 'NONPAYABLE');
    },

    // determine if ABI entry is an event
    isevent: function( ABI, i ) {
      if (ABI[i].type)
        return ABI[i].type.toUpperCase() == 'EVENT';
    },

    // determine if ABI entry payable
    ispayable: function( ABI, i ) {
      if (ABI[i].type && ABI[i].stateMutability)
        if (ABI[i].type.toUpperCase() == 'FUNCTION' || Web3UI.ABI.isconstructor( ABI, i ))
          return (ABI[i].stateMutability.toUpperCase() == 'PAYABLE') || ABI[i].payable;
    },

    // get name of method
    getname: function( ABI, i ) {
      return i + '_' + (Web3UI.ABI.isconstructor( ABI, i ) ? '0CONSTRUCTOR' : ABI[i].name);
    },

    // determine if ABI entry is the constructor
    isconstructor: function( ABI, i ) {
      if (ABI[i].type)
        return (ABI[i].type.toUpperCase() == 'CONSTRUCTOR');
    },

    // get inputs of method
    getinputs: function( ABI, i ) {
      return ABI[i].inputs ? ABI[i].inputs : [];
    },

    // get outputs of method
    getoutputs: function( ABI, i ) {
      return ABI[i].outputs ? ABI[i].outputs : [];
    },

    // save value for input
    saveval: function( methodname, idname, v ) {
      // var id = methodname + '_' + idname;
      // Web3UI.ABI.data.values[id] = v;
      if (!Web3UI.ABI.data.methods[methodname])
        Web3UI.ABI.data.methods[methodname] = {};
      var ids = Web3UI.ABI.data.methods[methodname];
      ids[idname] = v;
    },

    // get value of input
    getval: function( methodname, idname ) {
      //var v = Web3UI.ABI.data.values[methodname+'_'+idname];
      var ids = Web3UI.ABI.data.methods[methodname] ? Web3UI.ABI.data.methods[methodname] : {};
      var v = ids[idname];
      return v ? v : "";
    },

    // get all values for method
    getvals: function( methodname ) {
      var v = {};
      var ids = Web3UI.ABI.data.methods[methodname] ? Web3UI.ABI.data.methods[methodname] : {};
      for( var idname in ids )
        v[idname] = Web3UI.ABI.getval( methodname, idname );
      return v;
    },

    // make id name for input
    makeidname: function( methodname, parentidname, input, nextnoname ) {
      var inpname = input.name;
      if (!inpname)
        inpname = '0noname' + nextnoname[0], nextnoname[0]++;
      var idname = parentidname ? (parentidname+'_'+inpname) : inpname;
      /*if (!input.name)
        var id = methodname + '_' + idname;
        Web3UI.ABI.data.nonames[id] = inpname;
      }*/
      return idname;
    },

    // get attachment for array input
    getarrinput: function( methodname, input, idname ) {
      var id = methodname + '_' + idname;
      if (Web3UI.ABI.data.arrays[id])
        input = Web3UI.ABI.data.arrays[id].input;
      else {
        input = Web3UI.Utils.copymem( input );
        var elem = Web3UI.Utils.copymem( input );
        elem.type = elem.type.split('[]')[0];
        elem.internalType = elem.internalType ? elem.internalType.split('[]')[0] : elem.type;
        input.components = [];
        Web3UI.ABI.data.arrays[id] = {'input':input, 'element':elem};
      }
      return input;
    },

    // push elem to array input
    addarrelem: function( methodname, idname ) {
      var id = methodname + '_' + idname;
      var input = Web3UI.ABI.getarrinput( methodname, input, idname );
      var elem = Web3UI.Utils.copymem( Web3UI.ABI.data.arrays[id].element );
      var count = input.components.length;
      input.components.push( elem );
      input.components[count].name = '' + count;
      return input;
    },

    // pop elem of array input
    subarrelem: function( methodname, idname ) {
      var id = methodname + '_' + idname;
      var input = Web3UI.ABI.getarrinput( methodname, input, idname );
      if (!input.components.length)
        return input;
      var inputsub = input.components.pop();
      /*var elemnamesub = id + '_' + inputsub.name;
      for( var n in Web3UI.ABI.data.arrays )
        if (n.slice(0,elemnamesub.length) == elemnamesub)
          Web3UI.ABI.data.arrays[n].input.components = [];*/
      return input;
    },

    // clear elems of array input
    clrarrelems: function( methodname, idname ) {
      var id = methodname + '_' + idname;
      var input = Web3UI.ABI.getarrinput( methodname, input, idname );
      input.components = [];
      /*var elemnamesub = id;
      for( var n in Web3UI.ABI.data.arrays )
        if (n.slice(0,elemnamesub.length) == elemnamesub)
          Web3UI.ABI.data.arrays[n].input.components = [];*/
      return input;
    },

    // get dynamic input
    getinput: function( methodname, input, idname ) {
      if (Web3UI.ABI.isarr( input ))
        input = Web3UI.ABI.getarrinput( methodname, input, idname );
      return input;
    },

    // navigate through args tree, return string
    navinputs: function( methodname, inputs, pfxname, pfxidname, callbacks ) {
      var nextnoname = [0];
      function navarg( input, level, parentname, parentidname ) {
        var name = parentname ? parentname+'.'+input.name : input.name;
        idname = Web3UI.ABI.makeidname( methodname, parentidname, input, nextnoname );
        input = Web3UI.ABI.getinput( methodname, input, idname );
        var isarr = Web3UI.ABI.isarr( input );
        var s = "";
        if (isarr)
          s += callbacks.array( input, level, name, idname );
        if (input.components) {
          if (!isarr)
            s += callbacks.struct( input, level, name, idname );
          return s + callbacks.down( input, level, name, idname, isarr ) + 
                 navargs( input.components, isarr?0:level+1, name, idname ) + 
                 callbacks.up( input, level, name, idname, isarr );
        }
        return callbacks.atom( input, level, name, idname );
      }
      function navargs( inputs, level, parentname, parentidname ) {
        var frag = "";
        for( var k=0; k<inputs.length; k++ )
          frag += callbacks.before( inputs, k, level ) + 
                  navarg( inputs[k], level, parentname, parentidname ) + 
                  callbacks.after( inputs, k, level );
        return frag;
      }
      function nullcallback() {
        return '';
      }
      if (!callbacks) callbacks = {};
      if (!callbacks.before) callbacks.before = nullcallback;
      if (!callbacks.after) callbacks.after = nullcallback;
      if (!callbacks.down) callbacks.down = nullcallback;
      if (!callbacks.up) callbacks.up = nullcallback;
      if (!callbacks.array) callbacks.array = nullcallback;
      if (!callbacks.struct) callbacks.struct = nullcallback;
      if (!callbacks.atom) callbacks.atom = nullcallback;
      if (!pfxname) pfxname = '';
      if (!pfxidname) pfxidname = '';
      return navargs( inputs, 0, pfxname, pfxidname );
    },

    // navigate through args tree, return string
    navmethodinputs: function( ABI, i, callbacks ) {
      var methodname = Web3UI.ABI.getname( ABI, i );
      return Web3UI.ABI.navinputs( methodname, Web3UI.ABI.getinputs(ABI,i), callbacks );
    },

    // determine if ABI arg is array
    isarr: function( input ) {
      return (input.type.split('[]').length > 1);
    },

    // determine if ABI arg is an address
    isaddr: function( input ) {
      return (input.type.toUpperCase().slice(0,7) == 'ADDRESS');
    },

    // determine if ABI arg is a number
    isnum: function( input ) {
      return (input.type.toUpperCase().slice(0,4) == 'UINT') || (input.type.toUpperCase().slice(0,3) == 'INT');
    },

    // determine if ABI arg is a bool
    isbool: function( input ) {
      return (input.type.toUpperCase().slice(0,4) == 'BOOL');
    },

    // get type of input
    gettype: function( input ) {
      if (input.type.toUpperCase().slice(0,8) == 'FUNCTION')
        return '';
      return input.type;
    },

    // get viewname of methodname
    getviewname: function( methodname ) {
      var vn = methodname.split('_');
      if (vn.length > 1)
        return vn[1];
      return vn[0];
    }

  },

  /*** Generate code from ABI ***/
  Gen: {

    /*** Generate HTML for UI from ABI ***/
    HTML: {

      args: {
        start:   "<span class='control'>",
        end:     "</span>",
        inp:     "<span class='tag'>$INPUTNAME$ ($ARGTYPE$):</span> " + 
                 "<input type='text' id='Web3UI_$METHODNAME$_$ARGIDNAME$' " + 
                        'onchange="Web3UI.Interact.savearg(' + "'$METHODNAME$','$ARGIDNAME$'" + ')" ' + 
                        'oninput="Web3UI.Interact.cleartxmsgs(' + "'$METHODNAME$'" + ')" ' +
                        "value='$VALUE$'/> ",
        inpaddr: "<span class='control'>" +
                   "<span class='tag sameline'>$INPUTNAME$ ($ARGTYPE$):</span> " +  
                   '<span class="subbtn bug qr" onClick="Web3UI.Utils.Qr.scan(' + "'Web3UI_$METHODNAME$_$ARGIDNAME$'" + ');"></span>' +
                 "</span>" +
                 "<input type='text' id='Web3UI_$METHODNAME$_$ARGIDNAME$' " + 
                        'onchange="Web3UI.Interact.savearg(' + "'$METHODNAME$','$ARGIDNAME$'" + ')" ' + 
                        'oninput="Web3UI.Interact.cleartxmsgs(' + "'$METHODNAME$'" + ')" ' +
                        "value='$VALUE$'/> ",
        inpnum:  "<span class='tag'>$INPUTNAME$ ($ARGTYPE$):</span>" + 
                 "<input type='text' id='Web3UI_$METHODNAME$_$ARGIDNAME$' class='num' " + 
                        'onchange="Web3UI.Interact.savearg(' + "'$METHODNAME$','$ARGIDNAME$'" + ')" ' + 
                        'oninput="Web3UI.Interact.cleartxmsgs(' + "'$METHODNAME$'" + ')" ' +
                        "value='$VALUE$'/> ",
        inpbool: "<span class='tag'>$INPUTNAME$ ($ARGTYPE$):</span>" + 
                 "<input type='text' id='Web3UI_$METHODNAME$_$ARGIDNAME$' class='bool' " + 
                        'onchange="Web3UI.Interact.savearg(' + "'$METHODNAME$','$ARGIDNAME$'" + ')" ' + 
                        'oninput="Web3UI.Interact.cleartxmsgs(' + "'$METHODNAME$'" + ')" ' +
                        "value='$VALUE$'/> ",
        inparr: '<span class="control array"><span class="tag array">$INPUTNAME$ (array of $ARGTYPE$):</span> ' + 
                '<span class="subbtn" onclick="Web3UI.Gen.HTML.addArrElem(' + "'$METHODNAME$','$ARGNAME$','$ARGIDNAME$')" + '"/> + </span> ' +
                '<span class="subbtn" onclick="Web3UI.Gen.HTML.subArrElem(' + "'$METHODNAME$','$ARGNAME$','$ARGIDNAME$')" + '"/> - </span> ' +
                '<span class="subbtn" onclick="Web3UI.Gen.HTML.clrArrElems(' + "'$METHODNAME$','$ARGNAME$','$ARGIDNAME$')" + '"/> C </span>' +
                "</span>",
        inpstr: '<span class="control struct"><span class="tag">$INPUTNAME$ ($ARGTYPE$):</span></span>',
        inpdn:  "<span id='Web3UI_$METHODNAME$_$ARGIDNAME$_0components' class='nest'>",
        inpup:  "</span>"
      },

      // gen args HTML
      genargs: function( inputs, methodname, pfxname, pfxidname ) {
        function down( input, level, name, idname, isarr ) {
          return Web3UI.Utils.replace( Web3UI.Gen.HTML.args.inpdn, [ 
                    {token:'$METHODNAME$', replacewith:methodname, count:1 },
                    {token:'$ARGIDNAME$', replacewith:idname, count:1 } ] );
        }
        function up( input, level, name, idname, isarr ) {
          return Web3UI.Gen.HTML.args.inpup;
        }
        function before( inputs, index, level ) {
          return (index || level) ? "" : "";
        }
        function after( inputs, index, level ) {
          return '';
        }
        function stru( input, level, name, idname ) {
          var type = input.internalType ? input.internalType : input.type;
          var h = Web3UI.Utils.replace( Web3UI.Gen.HTML.args.inpstr, [ 
                    {token:'$INPUTNAME$', replacewith:input.name, count:1 },
                    {token:'$ARGTYPE$', replacewith:type, count:1 } ] );
          return h;
        }
        function arr( input, level, name, idname ) {
          var id = methodname + '_' + idname;
          var type = input.internalType ? input.internalType : input.type;
          type = type.split('[]')[0];
          var h = Web3UI.Utils.replace( Web3UI.Gen.HTML.args.inparr, [ 
                    {token:'$METHODNAME$', replacewith:methodname, count:3 },
                    {token:'$INPUTNAME$', replacewith:input.name, count:1 },
                    {token:'$ARGNAME$', replacewith:name, count:3 },
                    {token:'$ARGIDNAME$', replacewith:idname, count:3 },
                    {token:'$ARGTYPE$', replacewith:type, count:1 } ] );
          return h;
        }
        function atom( input, level, name, idname ) {
          var argtemplate = Web3UI.Gen.HTML.args.inp;
          if (Web3UI.ABI.isaddr( input ))
            argtemplate = Web3UI.Gen.HTML.args.inpaddr;
          if (Web3UI.ABI.isnum( input ))
            argtemplate = Web3UI.Gen.HTML.args.inpnum;
          if (Web3UI.ABI.isbool( input ))
            argtemplate = Web3UI.Gen.HTML.args.inpbool;
          var type = input.type;
          var val = Web3UI.ABI.getval( methodname, idname );
          var h = Web3UI.Utils.replace( argtemplate, [ 
                    {token:'$METHODNAME$', replacewith:methodname, count:3 },
                    {token:'$INPUTNAME$', replacewith:input.name, count:1 },
                    {token:'$ARGIDNAME$', replacewith:idname, count:2 },
                    {token:'$ARGTYPE$', replacewith:type, count:1 },
                    {token:'$VALUE$', replacewith:val, count:1 } ] );
          //console.log( "-------ATOM HTML--------", h );
          return Web3UI.Gen.HTML.args.start + h + Web3UI.Gen.HTML.args.end;
        }
        return Web3UI.ABI.navinputs( methodname, inputs, pfxname, pfxidname,
                             {'before':before, 'after':after, 'down':down, 'up':up, 'atom':atom, 'array':arr, 'struct':stru} );
      },

      regenArrElems: function( methodname, input, argname, argidname ) {
        Web3UI.Interact.cleartxmsgs( methodname );
        var elemsHTML = Web3UI.Gen.HTML.genargs( input.components, methodname, argname, argidname );
        return Web3UI.Utils.setin( 'Web3UI_'+methodname+'_'+argidname+'_0components', elemsHTML );
      },

      addArrElem: function( methodname, argname, argidname ) {
        var input = Web3UI.ABI.addarrelem( methodname, argidname );
        Web3UI.Gen.HTML.regenArrElems( methodname, input, argname, argidname );
      },

      subArrElem: function( methodname, argname, argidname ) {
        var input = Web3UI.ABI.subarrelem( methodname, argidname );
        Web3UI.Gen.HTML.regenArrElems( methodname, input, argname, argidname );
      },

      clrArrElems: function( methodname, argname, argidname ) {
        var input = Web3UI.ABI.clrarrelems( methodname, argidname );
        Web3UI.Gen.HTML.regenArrElems( methodname, input, argname, argidname );
      },

      // gen args input HTML from ABI entry
      genargsfromABIentry: function( ABI, i ) {
        return Web3UI.Gen.HTML.genargs( Web3UI.ABI.getinputs(ABI,i), Web3UI.ABI.getname(ABI,i) );
      },

      call:   "<p>" +
                "<b>$METHODVIEWNAME$</b>" +
                "<span class='subsec'>" +
                  "$ARGSHTML$" +
                "</span>" +
                "<span class='subsec'>" +
                  '<button id="Web3UI_$METHODNAME$_0callbtn" class="call" ' + 
                          'onClick="Web3UI.Interact.invoke(' + "'$METHODINDEX$'" + ')">Call</button>' +
                "</span>" +
                "<span class='toggle med closed' id='Web3UI_$METHODNAME$_foldpane'>" +
                  "<span class='subsec statusinfo'>" +
                    "<i id='Web3UI_$METHODNAME$'></i>" +
                  "</span>" +
                "</span>" +
              "</p>",

      pay:      "<span class='control pay'>" +
                  "<span class='tag'>Ether to send:</span> " + 
                  "<input type='text' value='0.0' id='Web3UI_$METHODNAME$_0pay' class='num' " +
                         'oninput="Web3UI.Interact.cleartxmsgs(' + "'$METHODNAME$'" + ')"/>' +
                "</span>",

      to:       "<span class='control zero'>" +
                  "<span class='control'>" +
                    "<span class='tag sameline'>Recipient address:</span> " + 
                    '<span class="subbtn bug qr" onClick="Web3UI.Utils.Qr.scan(' + "'Web3UI_0account_toaddress'" + ');"></span>' +
                  "</span>" +
                  "<input type='text' value='' id='Web3UI_0account_toaddress' " +
                         'oninput="Web3UI.Interact.cleartxmsgs()"/>' +
                "</span>",

      txhd:   "<p>" +
                "<b>$METHODVIEWNAME$ Transaction</b>" +
                "<span class='subsec'>" +
                  "$PAYHTML$" +
                  "$ARGSHTML$" +
                "</span>",

      deploy:   "<span class='subsec'>" +
                  "<span class='control'>" +
                    "<span class='tag sameline'>Contract bytecode (from compiler): </span> " + 
                    '<span class="subbtn attn" onclick="Web3UI.Utils.selfile(' + 
                                "'Web3UI_0contractbytecodefile'" + ')">Open from file</span>' +
                    '<span class="subbtn bug qr" onClick="Web3UI.Utils.Qr.scan(' + "'Web3UI_0contractbytecode'" + ');"></span>' +
                    "<input type='file' class='dispnone' accept='text/*' id='Web3UI_0contractbytecodefile' " + 
                              'onchange="Web3UI.Interact.openbytecode(this.files[0],' + "'$METHODNAME$'" + ');"/>' + 
                  "</span>" +
                  "<span class='control'>" +
                    "<textarea id='Web3UI_0contractbytecode' value='' " + 
                              'oninput="Web3UI.Interact.cleartxmsgs(' + "'$METHODNAME$'" + ')"></textarea>' +
                  "</span>" +
                "</span>",

      send:     "<span class='subsec'>" +
                  '<button id="Web3UI_$METHODNAME$_0signbtn" class="sign" ' + 
                          'onClick="Web3UI.Interact.invoke($METHODINDEX$)">Sign</button>' +
                  "<span class='toggle closed' id='Web3UI_$METHODNAME$_foldpane'>" +
                    "<span class='subsec statusinfo'>" +
                      "<i id='Web3UI_$METHODNAME$'></i>" +
                    "</span>" +
                  "</span>" +
                  "<span class='toggle long closed' id='Web3UI_$METHODNAME$_0hash_foldpane'>" +
                    "<span class='subsec txinfo'>" +
                      "<i id='Web3UI_$METHODNAME$_0hash'></i>" +
                      "<i id='Web3UI_$METHODNAME$_0cost'></i>" +
                      "<span class='control'>" +
                        "<button id='Web3UI_$METHODNAME$_0sendbtn' class='send hideifempty' " + 
                                'onClick="Web3UI.Interact.sendtx($METHODINDEX$)"></button>' +
                        "<i id='Web3UI_$METHODNAME$_0send'></i>" +
                        "<i id='Web3UI_$METHODNAME$_0fee'></i>" +
                      "</span>" +
                    "</span>" +
                  "</span>" +
                "</span>" +
              "</p>",

      save:     "<span class='subsec'>" +
                  '<button id="Web3UI_$METHODNAME$_0signbtn" class="sign" ' + 
                          'onClick="Web3UI.Interact.invoke($METHODINDEX$)">Sign</button>' +
                  "<span class='toggle closed' id='Web3UI_$METHODNAME$_foldpane'>" +
                    "<span class='subsec statusinfo'>" +
                      "<i id='Web3UI_$METHODNAME$'></i>" +
                    "</span>" +
                  "</span>" +
                  "<span class='toggle xlong closed' id='Web3UI_$METHODNAME$_0hash_foldpane'>" +
                    "<span class='subsec txinfo'>" +
                      "<i id='Web3UI_$METHODNAME$_0hash'></i>" +
                      "<i id='Web3UI_$METHODNAME$_0cost'></i>" +
                      "<i id='Web3UI_$METHODNAME$_0rawtx' class='code'></i>" +
                      "<span class='control max'>" +
                        "<span id='Web3UI_$METHODNAME$_0rawtxsavefilenametag' class='filenametag rawtx'></span>" +
                        "<input id='Web3UI_$METHODNAME$_0rawtxsavefilename' class='filename' value='' " + 
                               'onchange="Web3UI.Interact.rawtxsavefilenamechanged(' + "'$METHODNAME$'" + ')"></input>' +
                        "<span class='control min vertalign'>" +
                          "<button id='Web3UI_$METHODNAME$_0rawtxsavebtn' class='hideifempty sameline' " + 
                                  "onClick='Web3UI.Interact.savetx($METHODINDEX$)'></button> " +
                          "<button id='Web3UI_$METHODNAME$_0rawtxsaveqrbtn' class='hideifempty sameline' " + 
                                  'onClick="Web3UI.Utils.Qr.gen(' + "'Web3UI_$METHODNAME$_0rawtxdata'" + ');">QR</button>' +
                          /* '<span class="subbtn bug qr lg" onClick="Web3UI.Utils.Qr.gen(' +
                                             "'Web3UI_$METHODNAME$_0rawtxdata'" + ');"></span>' + */
                        "</span>" +
                        "<a href='' download='' class='dispnone' id='Web3UI_$METHODNAME$_0rawtxsave'></a>" +
                        "<i id='Web3UI_$METHODNAME$_0rawtxsavemsg'></i>" +
                      "</span>" +
                    "</span>" +
                  "</span>" +
                "</span>" +
              "</p>",


      // gen HTML for tx
      gentx: function( i, name, offline, isdeploy, ispayable, argsHTML ) {
        var payHTML = ispayable ? Web3UI.Utils.replace(Web3UI.Gen.HTML.pay,[{token:'$METHODNAME$',replacewith:name}]) : "";
        var vwname = i < 0 ? "Payment" : (isdeploy ? "Deploy" : "'" + Web3UI.ABI.getviewname(name) + "'");
        var tokens = [ 
          {token:'$METHODVIEWNAME$', replacewith:vwname },
          {token:'$METHODNAME$', replacewith:name },
          {token:'$PAYHTML$', replacewith:payHTML },
          {token:'$METHODINDEX$', replacewith:i },
          {token:'$ARGSHTML$', replacewith:argsHTML }
        ];
        var HtML = Web3UI.Utils.replace( Web3UI.Gen.HTML.txhd, tokens );
        if (isdeploy)
          HtML += Web3UI.Utils.replace( Web3UI.Gen.HTML.deploy, tokens );
        if (offline)
          HtML += Web3UI.Utils.replace( Web3UI.Gen.HTML.save, tokens );
        else
          HtML += Web3UI.Utils.replace( Web3UI.Gen.HTML.send, tokens );
        return HtML;
      },

      // gen HTML from ABI entry
      genfromABIentry: function( ABI, i, offline ) {
        var name = Web3UI.ABI.getname( ABI, i );
        if (!name)
          return "";
        if (Web3UI.ABI.isevent( ABI, i ))
          return "";
        var iscall = Web3UI.ABI.iscall( ABI, i );
        var isdeploy = Web3UI.ABI.isconstructor( ABI, i );
        if (!iscall && !isdeploy)
          if (!Web3UI.ABI.istx( ABI, i ))
            return "";
        var argsHTML = Web3UI.Gen.HTML.genargsfromABIentry( ABI, i );
        if (iscall) {
          var calltokens = [ 
            {token:'$METHODVIEWNAME$', replacewith:"'"+Web3UI.ABI.getviewname(name)+"'" },
            {token:'$METHODNAME$', replacewith:name, count:3 },
            {token:'$METHODINDEX$', replacewith:i, count:1 },
            {token:'$ARGSHTML$', replacewith:argsHTML, count:1 }
          ];
          return Web3UI.Utils.replace( Web3UI.Gen.HTML.call, calltokens );
        }
        var ispayable = Web3UI.ABI.ispayable( ABI, i );
        return Web3UI.Gen.HTML.gentx( i, name, offline, isdeploy, ispayable, argsHTML );
      },

      // gen dapp from ABI
      genfromABI: function( ABI, includecalls, includetxsends, includedeploy, offline ) {
        var HTML = "";
        for( var i=0; i<ABI.length; i++ ) {
          var H = Web3UI.Gen.HTML.genfromABIentry( ABI, i, offline );
          var isdeploy = Web3UI.ABI.isconstructor( ABI, i );
          var iscall = Web3UI.ABI.iscall( ABI, i );
          if (isdeploy) {
            if (includedeploy)
              HTML += H;
          }
          else {
            if (includecalls && iscall)
              HTML += H;
            if (includetxsends && !iscall)
              HTML += H;
          }
        }
        return HTML;
      },

      // gen HTML for a payment tx
      genpaytxcode: function( offline ) {
        return Web3UI.Gen.HTML.gentx( -1, '0account', offline, false, true, Web3UI.Gen.HTML.to );
      },

      callsection: {
        start:  "<p class='section'><b>Contract Queries</b> no wallet needed</p>",
        close:  ""
      },
      deploysection: {
        title: "<p class='section'><b>Deploy Contract Instance</b> " +
                "Wallet required to sign (<a href='wallet.html'>create wallet</a>)</p>",
      },
      sendsection: {
        title:  "<p class='section'><b>Contract Transactions</b> " + 
                "Wallet required to sign (<a href='wallet.html'>create wallet</a>) " +
                "</p>",

        head: "<p class='wallet'>" +
                "<b>Open Wallet</b>" +
                "<span class='subsec'>" +
                  "<span class='control'>" +
                    "<button class='open sameline' " +
                            'onclick="Web3UI.Utils.selfile(' + "'Web3UI_0account_file'" + ')">Open from File</button> ' +
                    '<input type="file" class="dispnone" accept="text/*" id="Web3UI_0account_file" ' +  
                                                  'onchange="Web3UI.Wallet.openfromfile(this.files[0],$OFFLINE$);"/>' +
                    "<label for='Web3UI_0account_pktoggle' class='toggler sameline'>Enter private key</label>" +
                    "<input type='checkbox' id='Web3UI_0account_pktoggle' class='toggler'></input>" +
                    "<span class='toggle closed'>" +
                      "<span class='subsec'>" +
                        "<span class='label tag'>Private key:</span>" +
                        "<input type='text' id='Web3UI_0account_privatekey' class='pk' oninput='Web3UI.Wallet.clr()'/> " +
                        "<button class='open' onclick='Web3UI.Wallet.open($OFFLINE$)'>Open from Input</button>" +
                      "</span>" +
                    "</span>" +
                  "</span>" +
                "</span>" +

                "<span class='toggle closed' id='Web3UI_0account_openresponse_foldpane'>" +
                  "<span class='subsec statusinfo'>" +
                    "<i id='Web3UI_0account_openresponse'></i>" +
                  "</span>" +
                "</span>" +

                "<span class='toggle closed' id='Web3UI_0account_savefilename_foldpane'>" +
                  "<span class='subsec'>" +
                    "<span id='Web3UI_0account_savefiletag' class='label tag'>File:</span>" +
                    "<input type='text' id='Web3UI_0account_savefilename' class='filename' value='' disabled/>" +
                  "</span>" +
                "</span>" +

                "<span class='toggle closed' id='Web3UI_0account_addressshow_foldpane'>" +
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
                "</span>",

        online: "<span class='subsec max'>" +
                  "<span class='control'>" +
                    "<span class='tag'>Balance</span>" +
                    "<input type='text' id='Web3UI_0account_balance' value='' size='10' class='num' disabled/> " +
                    "<span class='subbtn refresh' onClick='Web3UI.Wallet.getBalance();'></span>" + 
                  "</span>" +
                  "<span class='control'>" +
                    '<span class="tag">Transaction Count ("Nonce")</span>' +
                    "<input type='text' id='Web3UI_0account_nonce' value='' size='10' " + 
                           "class='num' oninput='Web3UI.Wallet.clrwmsg()'/> " +
                    "<span class='subbtn refresh' onClick='Web3UI.Wallet.getNonce();'></span>" + 
                  "</span>" +
                  "<span class='control'>" +
                    "<span class='tag'>Gas Price for Transactions</span>" +
                    "<input type='text' id='Web3UI_0account_gasprice' value='' size='10' class='num' " + 
                           "oninput='Web3UI.Wallet.clrwmsg()'/> " +
                    '<span class="subbtn refresh" onclick="Web3UI.Network.getGasPrice(' + "'Web3UI_0account'" + ');"></span>' +
                  "</span>" +
                  "<span class='control'>" +
                    "<span class='tag'>Gas Limit for Transactions</span>" +
                    "<input type='text' id='Web3UI_0account_gas' value='200000' size='10' " + 
                           "class='num' oninput='Web3UI.Wallet.clrwmsg()'/>" +
                  "</span>" +
                  "<span class='toggle closed' id='Web3UI_0account_response_foldpane'>" +
                    "<span class='subsec statusinfo'>" +
                      "<i id='Web3UI_0account_response'></i>" +
                    "</span>" +
                  "</span>" +
                "</span>" +
              "</p>",

        offline:"<span class='subsec max'>" +
                  "<span class='control'>" +
                    '<span class="tag">Transaction Count ("Nonce")</span>' +
                    "<input type='text' id='Web3UI_0account_nonce' value='' size='10' class='num' oninput='Web3UI.Wallet.clrwmsg()'/> " +
                  "</span>" +
                  "<span class='subsec min'>" +
                    "<span class='tag footnote i'>Value entered above must match nonce retrieved from network; " + 
                    "nonce will change after each transaction is sent.</span>" +
                  "</span>" +
                  "<span class='control med'>" +
                    "<span class='tag'>Gas Price for Transactions</span>" +
                    "<input type='text' id='Web3UI_0account_gasprice' value='' size='10' class='num' oninput='Web3UI.Wallet.clrwmsg()'/> " +
                  "</span>" +
                  "<span class='control'>" +
                    "<span class='tag'>Gas Limit for Transactions</span>" +
                    "<input type='text' id='Web3UI_0account_gas' value='200000' size='10' class='num' oninput='Web3UI.Wallet.clrwmsg()'/>" +
                  "</span>" +
                  "<span class='toggle closed' id='Web3UI_0account_response_foldpane'>" +
                    "<span class='subsec statusinfo'>" +
                      "<i id='Web3UI_0account_response'></i>" +
                    "</span>" +
                  "</span>" +
                "</span>" +
              "</p>",
        close:  ""
      },

      // gen open wallet HTML
      genwallethead: function( offline ) {
        var HTML = "";
        HTML += Web3UI.Utils.replace( 
                              Web3UI.Gen.HTML.sendsection.head, 
                              [{token:'$OFFLINE$', replacewith:offline?'true':'false', count:2}] );
        HTML += offline ? Web3UI.Gen.HTML.sendsection.offline : Web3UI.Gen.HTML.sendsection.online;
        return HTML;
      },

      // gen and place wallet HTML into page
      genwallet: function( offline ) {
        var HTML = Web3UI.Gen.HTML.genwallethead( offline );
        document.getElementById( 'Web3UI_0UIGENWALLET' ).innerHTML = HTML;
      },

      // gen and place pay tx HTML into page
      genpaytx: function( offline ) {
        HTML = Web3UI.Gen.HTML.genpaytxcode( offline );
        document.getElementById( 'Web3UI_0UIGENPAYTX' ).innerHTML = HTML;
      },

      // reset for new contract
      reset: function( offline ) {
        Web3UI.Gen.HTML.clrabi( offline );
        var id = 'Web3UI_0resetmsg';
        Web3UI.ABI.contractaddr = Web3UI.Utils.getv( 'Web3UI_0contractaddress' );
        if (!Web3UI.ABI.contractaddr)
          return Web3UI.Utils.showerr( id, "Contract address required" );
        if (!Web3UI.Network.testAddress( id, Web3UI.ABI.contractaddr ))
          return Web3UI.Utils.showerr( id, "Invalid contract address" );
        try {
          Web3UI.ABI.set( document.getElementById('Web3UI_0contractABI').value );
          var callHTML = Web3UI.Gen.HTML.genfromABI( Web3UI.ABI.get(), true, false, false, offline );
          var HTML = "";
          if (!offline && callHTML)
            HTML += Web3UI.Gen.HTML.callsection.start + 
                         callHTML + 
                         Web3UI.Gen.HTML.callsection.close;
          var sendHTML = Web3UI.Gen.HTML.genfromABI( Web3UI.ABI.get(), false, true, false, offline );
          if (sendHTML)
            HTML += Web3UI.Gen.HTML.sendsection.title +
                    Web3UI.Gen.HTML.genwallethead( offline ) +
                    sendHTML + 
                    Web3UI.Gen.HTML.sendsection.close;
          document.getElementById( 'Web3UI_0UIGEN' ).innerHTML = HTML;
        }
        catch( e ) {
          Web3UI.Gen.HTML.clrabi( offline );
          console.log( e );
          return Web3UI.Utils.showerr( id, "Invalid ABI" );
        }
        if (!Web3UI.Interact.getcontract( id ))
          return;
        //Web3UI.Interact.clearmsgs();
        Web3UI.Utils.showmsg( id, Web3UI.Utils.confirmed("dApp is ready to use below") );
      },

      // reset for new contract deployment
      noconstructor: {
        "inputs": [],
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      resetdeploy: function( offline ) {
        Web3UI.Gen.HTML.clrabi( offline );
        var id = 'Web3UI_0resetmsg';
        try {
          Web3UI.ABI.set( document.getElementById('Web3UI_0contractABI').value );
          var constr = Web3UI.Gen.HTML.genfromABI( Web3UI.ABI.get(), false, false, true, offline );
          if (!constr) {
            Web3UI.ABI.get().push( Web3UI.Gen.HTML.noconstructor );
            constr = Web3UI.Gen.HTML.genfromABI( Web3UI.ABI.get(), false, false, true, offline );
          }
          var HTML = Web3UI.Gen.HTML.deploysection.title + 
                     Web3UI.Gen.HTML.genwallethead( offline ) + 
                     constr + 
                     Web3UI.Gen.HTML.sendsection.close;
          HTML = HTML.replace( '200000', '2999999' );
          document.getElementById( 'Web3UI_0UIGEN' ).innerHTML = HTML;
        }
        catch( e ) {
          Web3UI.Gen.HTML.clrabi( offline );
          console.log( e );
          return Web3UI.Utils.showerr( id, "Invalid ABI" );
        }
        if (!Web3UI.Interact.getcontract( id, true ))
          return;
        //Web3UI.Interact.clearmsgs();
        Web3UI.Utils.showmsg( id, Web3UI.Utils.confirmed("Contract is ready to deploy below") );
      },

      clrabi: function( offline ) {
        Web3UI.Wallet.clr();
        document.getElementById( 'Web3UI_0UIGEN' ).innerHTML = "";
      },

abisection: {
        head:
          '<p>' +
          '<b>Contract</b>',
        deploy:
          '',

        presets:
          "<span class='subsec'>" +
            "<select id='Web3UI_0abiselect' onchange='Web3UI.Gen.HTML.selectabi(this.value);'>" +
              "$SELECTIONS$" +
            "</select>" +
          "</span>",

        transact:
          "<span class='subsec'>" +
            "<span class='control'>" +
              "<span class='control'>" +
                "<span class='tag sameline'>Address:</span> " +  
                '<span class="subbtn bug qr" onClick="Web3UI.Utils.Qr.scan(' + "'Web3UI_0contractaddress'" + ');"></span>' +
              "</span>" +
              "<input type='text' id='Web3UI_0contractaddress' oninput='Web3UI.Gen.HTML.abichanged();' value=''/>" +
            "</span>" +
          "</span>",

  abibox:
      "<span class='subsec min'>" +
        "<input type='checkbox' id='Web3UI_0contractabi_toggle' class='toggler'></input>" +
        "<span class='toggle long closed'>" +
          "<span class='subsec'>" +
            "<span class='control'>" +
              "<span class='tag sameline'>ABI: </span> " + 
              '<span class="subbtn attn" onclick="Web3UI.Utils.selfile(' + "'Web3UI_0file'" + ')">Open from file</span> ' +
              '<span class="subbtn bug qr" onClick="Web3UI.Utils.Qr.scan(' + "'Web3UI_0contractABI'" + ');"></span>' +
              '<input type="file" class="dispnone" accept="text/*" id="Web3UI_0file" ' +
                     'onchange="Web3UI.Gen.HTML.openabi(this.files[0],$ISDEPLOY$,$OFFLINE$);"/>' +
            "</span>" +
            "<span class='control'>" +
              '<textarea id="Web3UI_0contractABI" value="" size="30" oninput="Web3UI.Gen.HTML.abichanged();"></textarea>' +
            "</span>" +
          "</span>" +
        "</span>" +
      "</span>",

  genbtn:
      '<span class="subsec">' +
        '<span class="control">' +
          '<button class="sameline" onclick="Web3UI.Gen.HTML.abireset($ISDEPLOY$,$OFFLINE$);">Generate UI</button> ' +
          "<label for='Web3UI_0contractabi_toggle' class='$HIDEIFDEPLOY$toggler sameline'>View/edit ABI</label>" +
        '</span>' +
        "<span class='toggle closed' id='Web3UI_0resetmsg_foldpane'>" +
          "<span class='subsec statusinfo'>" +
            "<i id='Web3UI_0resetmsg'></i>" +
          '</span>' +
        '</span>' +
      '</span>',

  end:
          '</p>'
      },

      insertabisection: function( isdeploy, offline, presets ) {
        var html = Web3UI.Gen.HTML.abisection.head;
        var dflt = "";
        if (!isdeploy && presets) {
          var selHTML = "";
          if (presets) {
            for( var name in presets ) {
              selHTML += "<option value='" + name + "'>" + name + "</option>";
              if (!dflt)
                dflt = name;
            }
          }
          html += Web3UI.Utils.replace( Web3UI.Gen.HTML.abisection.presets, [{token:'$SELECTIONS$', replacewith:selHTML}] );
        }
        html += isdeploy ? Web3UI.Gen.HTML.abisection.deploy : Web3UI.Gen.HTML.abisection.transact;
        html += Web3UI.Gen.HTML.abisection.abibox;
        html += Web3UI.Gen.HTML.abisection.genbtn;
        var tokens = [
          {token:'$HIDEIFDEPLOY$', replacewith:isdeploy?'hidden ':''},
          {token:'$MINIFDEPLOY$', replacewith:isdeploy?' min':''},
          {token:'$ISDEPLOY$', replacewith:isdeploy?'true':'false'},
          {token:'$OFFLINE$', replacewith:offline?'true':'false'}
        ];
        html = Web3UI.Utils.replace( html, tokens );
        document.getElementById( 'Web3UI_0ABISECTION' ).innerHTML = html + Web3UI.Gen.HTML.abisection.end;
        setTimeout( "Web3UI.Gen.HTML.selectabi('" + dflt + "')", 1 );
      },

      presets: {contracts: {}, abis: {}},
      insertabi: function( isdeploy, offline, presetcontracts, presetabis ) {
        if (presetcontracts)
          Web3UI.Gen.HTML.presets.contracts = presetcontracts;
        if (presetabis)
          Web3UI.Gen.HTML.presets.abis = presetabis;
        Web3UI.Gen.HTML.insertabisection( isdeploy, offline, presetcontracts );
      },

      selectabi: function( name ) {
        var presets = Web3UI.Gen.HTML.presets.contracts;
        var abis = Web3UI.Gen.HTML.presets.abis;
        var addr = "", abi = null;
        if (name && presets && abis) {
          addr = presets[name].address ? presets[name].address : "";
          abi = presets[name].abi ? presets[name].abi : "";
          Web3UI.Gen.HTML.setabidefault( abi ? abis[abi].abi : null, addr );
          Web3UI.Gen.HTML.abichanged();
        }
        if (!abi)
          Web3UI.Utils.el( 'Web3UI_0contractabi_toggle' ).checked = true;
      },

      setabidefault: function( defaultabistr, defaultcontractaddress ) {
        Web3UI.Utils.setv( 'Web3UI_0contractaddress', defaultcontractaddress );
        try {
          if (defaultabistr && typeof defaultabistr == 'string')
            defaultabistr = defaultabistr ? JSON.parse( defaultabistr ) : "";
          defaultabistr = defaultabistr ? JSON.stringify( defaultabistr, null, 3 ) : "";
        }
        catch( e ) {
          defaultabistr = "";
        }
        Web3UI.Utils.setv( 'Web3UI_0contractABI', defaultabistr );
      },

      abireset: function( isdeploy, offline ) {
        if (isdeploy)
          Web3UI.Gen.HTML.resetdeploy( offline );
        else
          Web3UI.Gen.HTML.reset( offline );
      },

      abichanged: function( offline ) {
        var id = 'Web3UI_0resetmsg';
        Web3UI.Utils.showmsg( id, '' );
        Web3UI.Gen.HTML.clrabi( offline );
      },

      openabi: function( file, isdeploy, offline ) { 
        var id = 'Web3UI_0resetmsg';
        function err( msg ) {
          Web3UI.Gen.HTML.abichanged( offline );
          Web3UI.Utils.showeditmsg( 'Web3UI_0contractABI', "" );
        }
        function cb( abi ) {
          Web3UI.Gen.HTML.abichanged( offline );
          Web3UI.Utils.showeditmsg( 'Web3UI_0contractABI', JSON.stringify(abi,null,2) );
          //Web3UI.Gen.HTML.abireset( isdeploy, offline );
        }
        Web3UI.Utils.openjsonfile( id, file, cb, err );
      }

    },

    /*** Generate call/deploy/sign invocations from ABI ***/
    Invoke: {

      argcollect: "Web3UI.Interact.getarg($METHODINDEX$,'$ARGNAME$','$ARGIDNAME$','$ARGTYPE$')",

      // gen list of arg collectors for call/sign invocation
      genargs: function( ABI, i, inputs ) {
        function down( input, level, name, idname, isarr ) {
          var a = (level && input.name) ? (input.name+':') : '';
          return a + (isarr ? '[' : '{');
        }
        function up( input, level, name, idname, isarr ) {
          return  isarr ? ']' : '}';
        }
        function before( inputs, index, level ) {
          return index ? ',' : '';
        }
        function after( inputs, index, level ) {
          return '';
        }
        function atom( input, level, name, idname ) {
          var a = (level && input.name) ? (input.name+':') : '';
          a += Web3UI.Utils.replace( Web3UI.Gen.Invoke.argcollect, [ 
                      {token:'$METHODINDEX$', replacewith:i},
                      {token:'$ARGNAME$', replacewith:name},
                      {token:'$ARGIDNAME$', replacewith:idname},
                      {token:'$ARGTYPE$', replacewith:input.type} ] );
          return a;
        }
        var methodname = Web3UI.ABI.getname( ABI, i );
        var args = Web3UI.ABI.navinputs( methodname, inputs, '', '',
                             {'before':before, 'after':after, 'down':down, 'up':up, 'atom':atom} );
        return args;
      },

      // gen arg collectors for call/sign invocation
      genargslistfromABIentry: function( ABI, i ) {
        return Web3UI.Gen.Invoke.genargs( ABI, i, Web3UI.ABI.getinputs(ABI,i) );
      },

      methodcode:
        "function(contract){return contract.methods.$METHODVIEWNAME$($ARGS$);}",

      // gen method invocation from ABI entry
      genmethodfromABIentry: function( ABI, i ) {
        var args = Web3UI.Gen.Invoke.genargslistfromABIentry( ABI, i );
        return Web3UI.Utils.replace( Web3UI.Gen.Invoke.methodcode, [ 
            {token:'$METHODVIEWNAME$', replacewith:Web3UI.ABI.getviewname(Web3UI.ABI.getname(ABI,i)), count:1 },
            {token:'$ARGS$', replacewith:args, count:1 }] );
      },

      callinvocation:
        "Web3UI.Interact.call( $FUNC$, $METHODINDEX$ )",

      // gen call invocation from ABI entry
      gencallfromABIentry: function( ABI, i ) {
        var f = Web3UI.Gen.Invoke.genmethodfromABIentry( ABI, i );
        return Web3UI.Utils.replace( Web3UI.Gen.Invoke.callinvocation, [ 
            {token:'$FUNC$', replacewith:f, count:1 },
            {token:'$METHODINDEX$', replacewith:i, count:1 }] );
      },

      signinvocation:
        "Web3UI.Interact.sign( $FUNC$, $METHODINDEX$ )",

      // gen sign invocation from ABI entry
      gensignfromABIentry: function( ABI, i ) {
        var f = Web3UI.Gen.Invoke.genmethodfromABIentry( ABI, i );
        return Web3UI.Utils.replace( Web3UI.Gen.Invoke.signinvocation, [ 
            {token:'$FUNC$', replacewith:f, count:1 },
            {token:'$METHODINDEX$', replacewith:i, count:1 }] );
      },

      deploycode:
        "function(contract){return contract.deploy({data:Web3UI.Interact.getcontractbytecode(), arguments:[$ARGS$]});}",

      // gen deploy-sign invocation from ABI entry
      gendeployfromABIentry: function( ABI, i ) {
        var args = Web3UI.Gen.Invoke.genargslistfromABIentry( ABI, i );
        var f = Web3UI.Utils.replace( Web3UI.Gen.Invoke.deploycode, [ 
            {token:'$ARGS$', replacewith:args, count:1 }] );
        return Web3UI.Utils.replace( Web3UI.Gen.Invoke.signinvocation, [ 
            {token:'$FUNC$', replacewith:f, count:1 },
            {token:'$METHODINDEX$', replacewith:i, count:1 }] );
      },

      // gen invocation fun for call, sign, or deploy
      gen: function( i ) {
        var ABI = Web3UI.ABI.get();
        var isdeploy = Web3UI.ABI.isconstructor( ABI, i );
        var iscall = Web3UI.ABI.iscall( ABI, i );
        var f = isdeploy ? Web3UI.Gen.Invoke.gendeployfromABIentry(ABI,i) : 
                           (iscall ? Web3UI.Gen.Invoke.gencallfromABIentry(ABI,i) : Web3UI.Gen.Invoke.gensignfromABIentry(ABI,i));
        console.log( "INVOCATION:", f );
        return f;
      }

    }

  },

  /*** Interact with UI ***/
  Interact: {
      rawtxs: [], params: {},

      // gen and invoke call or sign function
      invoke: function( methodindex ) {
        if (methodindex < 0)
          return Web3UI.Wallet.signAccountTx();
        var f = Web3UI.Gen.Invoke.gen( methodindex );
        setTimeout( f, 1 );
      },

      // make arg id
      getargid: function( methodname, argidname ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        return ids.id + '_' + argidname;
      },

      // collect arg from input field
      getarg: function( methodindex, argname, argidname, argtype ) {
        var ABI = Web3UI.ABI.get();
        var methodname = Web3UI.ABI.getname( ABI, methodindex );
        var a = document.getElementById( Web3UI.Interact.getargid(methodname,argidname) ).value;
        if (a == "")
          throw( (argname?argname:"input") + " required" );

        if (argtype == 'bool') {
          if (a == 'true') 
            a = true;
          else
            if (a == 'false')
              a = false;
            else
              throw( (argname?argname:"input") + " must be either 'true' or 'false'" );
        }

        if (!Web3UI.Interact.params[methodname])
          Web3UI.Interact.params[methodname] = {};
        var p = Web3UI.Interact.params[methodname];
        p[argname] = a;
        return a;
      },

      // save arg from input field
      savearg: function( methodname, argidname ) {
        var id = Web3UI.Interact.getargid( methodname, argidname );
        var av = document.getElementById( id ).value;
        Web3UI.ABI.saveval( methodname, argidname, av );
        return av;
      },

      // get bytecode input
      getcontractbytecode: function() {
        var ids = Web3UI.Interact.gettxids();
        var contractbytecode = document.getElementById( ids.contractbytecode ).value;
        if (!contractbytecode)
          throw( "Contract bytecode required" );
        return contractbytecode;
      },

      openbytecode: function( file, methodname ) { 
        var ids = Web3UI.Interact.gettxids( methodname );
        function err( msg ) {
          Web3UI.Utils.showeditmsg( ids.contractbytecode, "" );
          Web3UI.Interact.cleartxmsgs( methodname );
        }
        function cb( bc ) {
          Web3UI.Utils.showeditmsg( ids.contractbytecode, bc );
          Web3UI.Interact.cleartxmsgs( methodname );
        }
        Web3UI.Utils.opentextfile( ids.id, file, cb, err, 'rejectjson' );
      },

      // call contract
      call: function( f, methodindex ) {
        var ABI = Web3UI.ABI.get();
        var ids = Web3UI.Interact.gettxids( Web3UI.ABI.getname(ABI,methodindex) );
        var id = ids.id;
        var contract = Web3UI.Interact.getcontract( id );
        if (!contract)
          return;
        function oncompletion( err, res ) {
          // test cases
          //err = 0, res = false;
          //err = 0, res = 100;
          //err = 0, res = "valid result";
          //err = 0, res = {"result": "100"};
          //err = 0, res = ["result", "100", {arg: 333}]; 
          //err = "Error: Returned error: execution reverted: divide by 0";
          //err = "Error: Returned error: execution reverted";
          //err = "Error: Returned error: universe farted";
          //err = "Error: Returned values aren't valid, did it run Out of Gas? You might also see this error"
          //err = "Error: Returned error";
          if (err) {
            err = err.toString();
            var reason = "Unavailable";
            var m = "Error: Returned error: execution reverted";
            if (err.slice(0,m.length) == m)
              err = err.slice( m.length );
            m = "Error: Returned error";
            if (err.slice(0,m.length) == m)
              err = err.slice( m.length );
            if (err.slice(0,2) == ": ")
              err = "Failed, response was: " + err.slice(2);
            err = err ? err : reason;
          }
          Web3UI.Utils.showmsg( id, err ? Web3UI.Utils.err(err) : Web3UI.Utils.confirmed(JSON.stringify(res)) );
        }
        try {
          var c = f( contract );
          c.call( oncompletion );
        }
        catch( e ) {
          oncompletion( e );
        }
      },

      // initialize txdef for sign
      initTxDef: function( methodname ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        if (!Web3UI.Wallet.getWallet( ids.id ))
          return;
        var txdef = {
          gas: document.getElementById( ids.gas ).value,
          gasPrice: document.getElementById( ids.gasprice ).value,
          nonce: document.getElementById( ids.nonce ).value,
          chainId: document.getElementById( ids.chainid ).value
        };
        if (txdef.nonce === "")
          return Web3UI.Interact.showsignmsgs( methodname, "Account nonce required" );
        if (!txdef.gasPrice)
          return Web3UI.Interact.showsignmsgs( methodname, "Gas price required" );
        if (!txdef.gas)
          txdef.gas = "0";
        if (!txdef.chainId)
          return Web3UI.Interact.showsignmsgs( methodname, "Chain ID required (see bottom of page)" );
        try {
          var forceexception_ifnotnumber = Web3UI.Utils.toBN( txdef.chainId );
          forceexception_ifnotnumber = Web3UI.Utils.toBN( txdef.gas );
          forceexception_ifnotnumber = Web3UI.Utils.toBN( txdef.gasPrice );
          forceexception_ifnotnumber = Web3UI.Utils.toBN( txdef.nonce );
          if (txdef.gasPrice <= 0)
            return Web3UI.Interact.showsignmsgs( methodname, "Invalid gas price" );
        }
        catch( e ) {
          return Web3UI.Interact.showsignmsgs( methodname, e );
        }
        return txdef;
      },

      // sign a prepared tx def
      signtxdef: function( methodname, txdef, rawtxs, rawtxindex, name ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        var account = Web3UI.Wallet.getWallet( ids.id );
        if (!account)
          return;
        var txcost;
        function oncompletion( err, res ) {
          Web3UI.Interact.showsignmsgs( methodname, err, res, txcost, name );
          rawtxs[rawtxindex] = (err || !res) ? "" : res.rawTransaction;
        }
        try {
          txcost = Web3UI.Network.calccost( txdef.value, txdef.gas, txdef.gasPrice, true );
          tx = Web3UI.Network.web3.eth.accounts.signTransaction( txdef, account.privateKey, oncompletion );
        }
        catch( e ) {
          oncompletion( e );
          tx = "";
        }
        return tx;
      },

      // sign a tx for contract
      sign: function( f, methodindex ) {
        Web3UI.Interact.rawtxs[methodindex] = "";
        var ABI = Web3UI.ABI.get();
        var methodname = Web3UI.ABI.getname( ABI, methodindex );
        var ids = Web3UI.Interact.gettxids( methodname );
        var id = ids.id;
        var txdef = Web3UI.Interact.initTxDef( methodname );
        if (!txdef)
          return;
        var isdeploy = Web3UI.ABI.isconstructor( ABI, methodindex );
        var contract = Web3UI.Interact.getcontract( id, isdeploy );
        if (!contract)
          return;
        try {
          if (!isdeploy) {
            txdef.to = Web3UI.Utils.getv( ids.contractaddress, '' );
            if (!txdef.to)
              throw( 'Contract address required' );
          }
          if (Web3UI.ABI.ispayable( ABI, methodindex )) {
            txdef.value = Web3UI.Utils.getv( ids.pay );
            txdef.value = Web3UI.Network.web3.utils.toWei( txdef.value, 'ether' );
          }
          Web3UI.Interact.params[methodname] = {};
          var mc = f( contract );
          txdef.data = mc.encodeABI();
        }
        catch( e ) {
          return Web3UI.Interact.showsignmsgs( methodname, e );
        }
        Web3UI.Interact.signtxdef( methodname, txdef, Web3UI.Interact.rawtxs, methodindex );
      },

      // send signed raw tx
      _sendrawtx: {pending: {}},
      sendrawtx: function( methodname, rawtx ) {
        if (!rawtx)
          return Web3UI.Utils.showerr( id, "Sign transaction first" );
        if (!confirm( "Send transaction? (action is final)" ))
          return;
        var ids = Web3UI.Interact.gettxids( methodname );
        var id = ids.send;
        Web3UI.Utils.setin( ids.sendbtn, "" );
        Web3UI.Interact._sendrawtx.pending[methodname] = rawtx;
        Web3UI.Utils.en( ids.signbtn, false );
        function showmsg( msg ) {
          if (Web3UI.Interact._sendrawtx.pending[methodname] == rawtx) {
            Web3UI.Utils.showmsg( id, msg );
            Web3UI.Utils.en( ids.signbtn, true );
          }
          console.log( msg );
        }
        function onwait( msg ) {
          showmsg( msg );
        }
        function onerror( errmsg ) {
          showmsg( errmsg );
          Web3UI.Wallet.getWalletInfo();
        }
        function oncompletion( resmsg, receipt ) {
          showmsg( resmsg );
          Web3UI.Wallet.getWalletInfo();
        }
        Web3UI.Network.broadcastTx( rawtx, 
          { 'gasprice':Web3UI.Utils.getv(ids.gasprice,""), 
            'gas':Web3UI.Utils.getv(ids.gas,""),
            'gaslimit':Web3UI.Utils.getv(ids.gas,""),
            'value':Web3UI.Utils.getv(ids.pay,"0.0"), 
            'name':ids.name, 
            'hash':Web3UI.Interact.gettxhash(methodname), 
            'idmsg':ids.broadcastconsole, 
            'idcost':ids.fee },
          { 'oncompletion':oncompletion, 'onwait':onwait, 'onerror':onerror } );
      },

      // send signed tx
      sendtx: function( methodindex ) {
        if (methodindex < 0)
          return Web3UI.Wallet.sendAccountTx();
        var ABI = Web3UI.ABI.get();
        var rawtx = Web3UI.Interact.rawtxs[methodindex];
        Web3UI.Interact.sendrawtx( Web3UI.ABI.getname(ABI,methodindex), rawtx );
      },

      // save raw tx
      saverawtx: function( methodname, rawtx, name ) {
        if (!Web3UI.Wallet.account)
          return Web3UI.Utils.showerr( ids.rawtxsavemsg, "Wallet required" );
        var ids = Web3UI.Interact.gettxids( methodname );
        if (!rawtx)
          return Web3UI.Utils.showerr( ids.rawtxsavemsg, "Sign transaction first" );

        var fn = Web3UI.Utils.getv( ids.rawtxsavefn );
        if (!fn)
          fn = Web3UI.Interact.getrawtxsavefilename( methodname, name );
        var contents = Web3UI.Interact.getrawtxsavefilecontents( methodname, rawtx, name );
        Web3UI.Utils.savejsonfile( ids.rawtxsave, fn, contents );

        /*
        var e = document.getElementById( ids.rawtxsave );
        e.download = Web3UI.Utils.getv( ids.rawtxsavefn );
        if (!e.download)
          e.download = Web3UI.Interact.getrawtxsavefilename( methodname, name );
        var contents = Web3UI.Interact.getrawtxsavefilecontents( methodname, rawtx, name );
        console.log( contents );
        e.href = Web3UI.Utils.todataurl( 'text/plain', JSON.stringify(contents) );
        //"data:text/plain," + JSON.stringify( contents );
        e.click();
        */
      },

      // save signed tx
      savetx: function( methodindex ) {
        if (methodindex < 0)
          return Web3UI.Wallet.saveAccountTx();
        var ABI = Web3UI.ABI.get();
        var rawtx = Web3UI.Interact.rawtxs[methodindex];
        Web3UI.Interact.saverawtx( Web3UI.ABI.getname(ABI,methodindex), rawtx );
      },

      // get rawtx json file contents
      getrawtxsavefilecontents: function( methodname, rawtx, name ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        var contents = {
          "Action": ids.name == 'payment' ? "Send ether to address"
                    : (ids.name == 'deploy' ? "Deploy new contract instance" : "Run method in contract")
        };
        contents["Transaction"] = {
          "Sender":         Web3UI.Wallet.account.address, 
          "Ether to send":  Web3UI.Utils.getv( ids.pay, "0.0" )
        };
        if (ids.name == 'payment') {
          contents.Transaction["Recipient"] = Web3UI.Utils.getv( 'Web3UI_0account_toaddress', '' );
        }
        else {
          contents.Transaction.Method = {};
          if (ids.name == 'deploy') {
            contents.Transaction.Method["Name"] = "Initialize";
            contents.Transaction.Method["Contract bytecode"] = Web3UI.Utils.getv( ids.contractbytecode );
          }
          else {
            contents.Transaction.Method["Target contract"] = Web3UI.Utils.getv( ids.contractaddress );
            contents.Transaction.Method["Name"] = ids.name;
          }
          var v = Web3UI.Interact.params[methodname];
          for( var p in v )
            contents.Transaction.Method[p] = v[p];
        }
        contents.Transaction["Nonce"] =     Web3UI.Utils.getv( ids.nonce ),
        contents.Transaction["Gas"] =       Web3UI.Utils.getv( ids.gas ),
        contents.Transaction["Gas price"] = Web3UI.Utils.getv( ids.gasprice ),
        contents.Transaction["Chain id"] =  Web3UI.Utils.getv( ids.chainid )
        contents["Transaction id"] = Web3UI.Interact.gettxhash( methodname );
        contents["rawtx"] = rawtx;

        /*
        var w3u = Web3UI.Network.web3.utils;
        contents.Debug = {};
        contents.Debug["Nonce"] =         w3u.toHex( Web3UI.Utils.getv(ids.nonce) ),
        contents.Debug["Gas"] =           w3u.toHex( Web3UI.Utils.getv(ids.gas) ),
        contents.Debug["Gas price"] =     w3u.toHex( Web3UI.Utils.getv(ids.gasprice) );
        contents.Debug["Ether to send"] = w3u.toHex( w3u.toWei(Web3UI.Utils.getv(ids.pay,"0.0"),'ether') );
        */

        return contents;
      },

      // get tx hash
      gettxhash: function( methodname ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        var hash = Web3UI.Utils.getmsg( ids.hashcontent, "" );

        /*
        var label = "Transaction ID: ";
        if (hash.slice(0,label.length) == label)
          hash = hash.slice( label.length );
        label = "<span class='label'>Transaction ID: </span>";
        hash = Web3UI.Utils.replacetoks( hash, '"', "'" );
        if (hash.slice(0,label.length) == label)
          hash = hash.slice( label.length );
        */

        console.log( hash );
        return hash;
      },

      // make file name from tx hash
      getrawtxsavefilename: function( methodname ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        var name = ids.name;
        var hash = Web3UI.Interact.gettxhash( methodname );
        return Web3UI.appname + "-rawtx-" + name + "-" + hash.slice(0,8) + "--" + hash.slice(hash.length-4) + ".txt";
      },

      // on file name edit
      rawtxsavefilenamechanged: function( methodname, name ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        var idfn = ids.rawtxsavefn;
        var fn = Web3UI.Utils.getv( idfn );
        if (!fn)
          Web3UI.Utils.showeditmsg( idfn, Web3UI.Interact.getrawtxsavefilename(methodname,name) );
      },

      // show sign msgs
      showsignmsgs: function( methodname, err, res, txcost, name ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        err = err ? err : "";
        Web3UI.Utils.showmsg( ids.id, (err||!res) ? Web3UI.Utils.err(err) : "" );
        Web3UI.Utils.showmsg( ids.hash, (err||!res) ? "" : 
                      "<span class='label'>Transaction ID: </span>" + 
                      "<span class='selectable' id='" + ids.hashcontent + "'" + 
                           " onclick='Web3UI.Utils.select(this)'>" + res.transactionHash + "</span>" );
        Web3UI.Utils.showmsg( ids.cost, (err||!txcost) ? "" : "<span class='label'>Maximum to spend: </span>" + txcost + " ether" );
        Web3UI.Utils.showmsg( ids.send, "" );
        Web3UI.Utils.setin( ids.sendbtn, (err||!res) ? "" : "Send" );
        Web3UI.Utils.showmsg( ids.rawtx, (err||!res) ? "" : 
                                         "<span class='label'>Raw transaction: </span>" + 
                                         "<span id='" + ids.rawtxdata + "' " +
                                               "class='selectable hexscroll' onclick='Web3UI.Utils.Qr.select(this)'>" + 
                                               res.rawTransaction + "</span>" );
        Web3UI.Utils.showmsg( ids.rawtxsavefntag, (err||!res) ? "" : "File name: " );
        Web3UI.Utils.showeditmsg( ids.rawtxsavefn, (err||!res) ? "" : Web3UI.Interact.getrawtxsavefilename(methodname,name) );
        Web3UI.Utils.setin( ids.rawtxsavebtn, (err||!res) ? "" : "Save" );

        /*
        if (!err && res && res.rawTransaction &&
            Web3UI.Network._broadcasttx.posted[res.rawTransaction] && Web3UI.Network._broadcasttx.posted[res.rawTransaction].msg) {
          var msg = "Transaction with same nonce is pending (wait for nonce to update then re-sign)";
          if (Web3UI.Network._broadcasttx.posted[res.rawTransaction].msg.slice(0,9) == "Confirmed")
            msg = "Transaction with same nonce previously sent (update wallet nonce then re-sign)";
          Web3UI.Utils.en( ids.signbtn, false );
          Web3UI.Utils.setin( ids.sendbtn, "" );
          Web3UI.Utils.showmsg( ids.send, msg );
        }
        */

        Web3UI.Interact._sendrawtx.pending[methodname] = "";

      },

      // get id set for method section
      gettxids: function( methodname ) {
        methodname = methodname ? methodname : '0account';
        methodviewname = Web3UI.ABI.getviewname( methodname );
        var id = 'Web3UI_' + methodname;
        return {
          name: methodviewname === '0CONSTRUCTOR' ? 'deploy' 
                : (methodviewname === '0account' ? 'payment' : methodviewname),
          contractABI: 'Web3UI_0contractABI',
          contractABIresetmsg: 'Web3UI_0resetmsg',
          contractaddress: 'Web3UI_0contractaddress',
          gas: 'Web3UI_0account_gas', 
          gasprice: 'Web3UI_0account_gasprice',
          nonce: 'Web3UI_0account_nonce',
          chainid: 'Web3UI_0network_chainid',
          contractbytecode: 'Web3UI_0contractbytecode',
          'id': id,
          foldpane: id+'_0hash_foldpane',
          hash: id+'_0hash',
          hashcontent: id+'_0hashcontent',
          pay: id+'_0pay',
          cost: id+'_0cost',
          fee: id+'_0fee',
          signbtn: id+'_0signbtn',
          sign: id+'_0sign',
          sendbtn: id+'_0sendbtn',
          send: id+'_0send',
          broadcastconsole: 'Web3UI_0broadcastconsole',
          rawtx: id+'_0rawtx',
          rawtxdata: id+'_0rawtxdata',
          rawtxsave: id+'_0rawtxsave',
          rawtxsavemsg: id+'_0rawtxsavemsg',
          rawtxsavebtn: id+'_0rawtxsavebtn',
          rawtxsavefn: id+'_0rawtxsavefilename',
          rawtxsavefntag: id+'_0rawtxsavefilenametag' };
      },

      // clear msgs in transaction section
      cleartxmsgs: function( methodname ) {
        var ids = Web3UI.Interact.gettxids( methodname );
        Web3UI.Utils.clearmsgs( [ids.id,
                                 ids.hash,
                                 ids.cost,
                                 ids.fee,
                                 ids.sendbtn,
                                 ids.send,
                                 ids.rawtx,
                                 ids.rawtxsavebtn,
                                 ids.rawtxsavemsg,
                                 ids.rawtxsavefntag ] );
        Web3UI.Utils.en( ids.signbtn, true );
      },

      // clear msgs for a method or all methods
      clearmsgs: function( methodindex, calls ) {
        var ABI = Web3UI.ABI.get();
        if (!ABI)
          return;
        Web3UI.Interact.rawtxs = [];
        function clr( i ) {
          var methodname = Web3UI.ABI.getname( ABI, i );
          if (Web3UI.ABI.iscall( ABI, i )) {
            if (calls)
              Web3UI.Utils.clearmsgs( [Web3UI.Interact.gettxids(methodname).id] );
          }
          else
            Web3UI.Interact.cleartxmsgs( methodname );
          Web3UI.Interact.rawtxs[i] = "";
        }
        if (methodindex === undefined || methodindex < 0) {
          for( var i=0; i<ABI.length; i++ )
            clr( i );
        }
        else
          return clr( methodindex );
      },

      // get web3.js contract object
      getcontract: function( idres, noaddress ) {
        Web3UI.Utils.showmsg( idres, "waiting for reply..." );
        if (!noaddress)
          if (!Web3UI.ABI.contractaddr)
            return Web3UI.Utils.showerr( idres, "Contract Address required" );
        try {
          var ABI = JSON.parse( document.getElementById(Web3UI.Interact.gettxids().contractABI).value );
          if (noaddress)
            return new Web3UI.Network.web3.eth.Contract( ABI );
          return new Web3UI.Network.web3.eth.Contract( ABI, Web3UI.ABI.contractaddr );
        }
        catch( e ) {
          Web3UI.Utils.showerr( idres, e );//"Contract ABI or Address is invalid" );
        }
      }

  },

  /*** Network module ***/
  Network: {

    defaultProvider: "https://cloudflare-eth.com",
    providerId: 'Web3UI_0network_provider',

    // get a web3 instance
    getconnection: function() {
      var p = Web3UI.Utils.getv( Web3UI.Network.providerId, Web3UI.Network.defaultProvider );
      return new Web3( p );
    },

    // wake up web3 and establish provider
    setconnection: function() {
      var p = Web3UI.Utils.getv( Web3UI.Network.providerId, Web3UI.Network.defaultProvider );
      Web3UI.Network.web3 = new Web3( p );
    },

    // get recent gas price
    getGasPrice: function( idpfx, callback ) {
      var id = idpfx+'_response';
      var idval = idpfx+'_gasprice';
      function oncompletion( err, wei ) {
        var msg = "", showmsg = "";
        if (err) {
          msg = "Attempt to update gas price failed";
          showmsg = Web3UI.Utils.err( err, msg );
        }
        else {
          Web3UI.Network.gasprice = wei;
          Web3UI.Utils.showeditmsg( idval, Web3UI.Network.gasprice );
          msg = "Gas price " + Web3UI.Network.web3.utils.fromWei(wei.toString(),'ether') + " ether";
          showmsg = Web3UI.Utils.confirmed( msg );
        }
        if (callback)
          callback( err, msg );
        else
          Web3UI.Utils.showmsg( id, showmsg );
      }
      Web3UI.Utils.showmsg( id, "Requesting gas price..." );
      Web3UI.Network.web3.eth.getGasPrice( oncompletion );
    },

    // test address validity
    testAddress: function( idmsg, address ) {
      if (!address)
        return Web3UI.Utils.showerr( idmsg, "Address required" );
      if (Web3UI.Network.web3.utils.isAddress( address ))
        return true;
      else
        Web3UI.Utils.showerr( idmsg, "Invalid ethereum address" );
    },

    // get balance of address
    getAddressBalance: function( idpfx, address, callback ) {
      var id = idpfx+'_response';
      var idval = idpfx+'_balance';
      function oncompletion( err, wei ) {
        var msg = "", showmsg = "";
        if (err) {
          msg = "Attempt to update balance failed";
          showmsg = Web3UI.Utils.err( err, msg );
        }
        else {
          msg = "Balance " + Web3UI.Network.web3.utils.fromWei(wei,'ether') + " ether";
          showmsg = Web3UI.Utils.confirmed( msg );
          Web3UI.Utils.showeditmsg( idval, Web3UI.Network.web3.utils.fromWei(wei,'ether') );
        }
        if (callback)
          callback( err, msg );
        else
          Web3UI.Utils.showmsg( id, showmsg );
      }
      try {
        Web3UI.Utils.showmsg( id, "Requesting balance..." );
        Web3UI.Network.web3.eth.getBalance( address, oncompletion );
      } 
      catch( e ) { 
        oncompletion( e );
      }
    },

    // get nonce of address
    getAddressNonce: function( idpfx, address, callback ) {
      var id = idpfx+'_response';
      var idval = idpfx+'_nonce';
      Web3UI.Wallet.nonce = -1;
      function oncompletion( err, count ) {
        var msg = "", showmsg;
        Web3UI.Wallet.nonce = err?-1:count;
        if (err) {
          msg = "Attempt to update nonce failed";
          showmsg = Web3UI.Utils.err( err, msg );
        }
        else {
          msg = "Nonce " + count;
          showmsg = Web3UI.Utils.confirmed( msg );
          Web3UI.Utils.showeditmsg( idval, Web3UI.Wallet.nonce );
        }
        if (callback)
          callback( err, msg );
        else
          Web3UI.Utils.showmsg( id, showmsg );
      }
      try {
        Web3UI.Utils.showmsg( id, "Requesting nonce..." );
        Web3UI.Network.web3.eth.getTransactionCount( address, oncompletion );
      } 
      catch( e ) {
        oncompletion( e );
      }
    },

    // get/test address
    getAddress: function( idpfx, address ) {
      if (!address)
        address = Web3UI.Utils.getv( idpfx+'_address', '' );
      if (Web3UI.Network.testAddress( idpfx+'_response', address ))
        return address;
    },

    // update address info
    msgchain: "",
    preverr: "",
    getAddressInfo: function( idpfx, action, address ) {
      Web3UI.Network.msgchain = "", Web3UI.Network.preverr = "";
      var address = Web3UI.Network.getAddress( idpfx, address );
      if (!address)
        return;
      function callback( err, res ) {
        if (err) {
          err = err.toString();
          if (err == Web3UI.Network.preverr)
            Web3UI.Network.msgchain = "";
          Web3UI.Network.preverr = err;
          res = "Attempt to update Balance, Nonce, and Gas Price failed";
        }
        Web3UI.Network.msgchain = Web3UI.Network.msgchain ? (Web3UI.Network.msgchain + ", " + res) : res;
        Web3UI.Utils.showmsg( idpfx+'_response',
                   err ? Web3UI.Utils.err(err,Web3UI.Network.msgchain) : Web3UI.Utils.confirmed(Web3UI.Network.msgchain) );
      }
      if (!action || action == 'nonce')
        Web3UI.Network.getAddressNonce( idpfx, address, action?null:callback );
      if (!action || action == 'balance')
        Web3UI.Network.getAddressBalance( idpfx, address, action?null:callback );
      if (!action || action == 'gasprice')
        Web3UI.Network.getGasPrice( idpfx, action?null:callback );
    },

    // calc fee plus value sent (if any)
    calccost: function( value, gas, gasprice, throwonerr ) {
      var cost = "";
      try {
        cost = Web3UI.Utils.toBN( value?value:"0" );
        var fee = Web3UI.Utils.multBN( gas, gasprice );
        cost = cost.add( fee );
        cost = Web3UI.Network.web3.utils.fromWei( cost.toString(), 'ether' );
      }
      catch( e ) {
        if (throwonerr) throw( e ); 
      }
      return cost;
    },

    // write msg to broadcast console
    writeconsole: function( idconsole, msg ) {
      if (idconsole) {
        var cm = Web3UI.Utils.getmsg( idconsole, "" );
        Web3UI.Utils.showmsg( idconsole, cm+msg );
        Web3UI.Utils.scrolltobottom( idconsole );
      }
    },

    // add msg to broadcast console
    chgconsoletitle: function( idconsole, counts ) {
      var msg = counts.pending ? "<span class='pending'>" + counts.pending + " pending" + "</span>" : "";
      var conf = counts.sent - counts.failed - counts.pending;
      conf = conf ? "<span class='confirmed'>" + conf + " confirmed" + "</span>" : "";
      msg += conf ? (msg ? ", " + conf : conf) : "";
      var fail = counts.failed ? "<span class='failed'>" + counts.failed + " failed" + "</span>" : "";
      msg += fail ? (msg ? ", " + fail : fail) : "";
      Web3UI.Utils.showmsg( idconsole+'_title', "Transaction Log (" + msg + ")" );
    },

    // add msg to broadcast console
    addconsolemsg: function( idconsole, msg, stats, msgnum, csscls, counts ) {
      csscls = csscls ? (' ' + csscls) : '';
      var txstats = "<div class='consolemsg" + csscls + "'>";
      txstats += "[Transaction " + stats.txnum;
      if (stats.hash)
        txstats += ": <span class='tt selectable' onclick='Web3UI.Utils.select(this)'>" + stats.hash + "</span>";
      txstats += "]<br/><div class='consolemsg sub'>";
      if (msgnum == 1) {
        if (stats.name)
          txstats += stats.name[0].toUpperCase() + stats.name.slice(1) + ", ";
        var prov = stats.provider; //Web3UI.Utils.getv( 'Web3UI_0network_provider', "" );
        var chid = stats.chainid;  //Web3UI.Utils.getv( 'Web3UI_0network_chainid', "" );
        if (prov)
          txstats += "posted via <span class='tt'>" + prov + "</span> ";
        if (chid)
          txstats += "(chain " + chid + ")";
        if (prov || chid)
          txstats += "<br/>";
      }
      msg = txstats + msg + "</div></div>";
      Web3UI.Network.writeconsole( idconsole, msg );
      return msgnum + 1;
    },

    // broadcast a signed tx, stats:{gasprice, gas, idmsg}
    _broadcasttx: {counts: {sent: 0, pending: 0, failed: 0}, posted: {}},
    broadcastTx: function( rawtx, stats, callbacks ) {
      rawtx = rawtx.slice( 0 );
      if (Web3UI.Network._broadcasttx.posted[rawtx]) {
        if (callbacks.onwait)
          return callbacks.onwait( Web3UI.Network._broadcasttx.posted[rawtx].msg );
        return false;
      }
      stats.hash = stats.hash ? stats.hash : "";
      Web3UI.Network._broadcasttx.counts.sent++;
      Web3UI.Network._broadcasttx.counts.pending++;
      stats.txnum = Web3UI.Network._broadcasttx.counts.sent;
      stats.provider = Web3UI.Utils.getv( 'Web3UI_0network_provider', "" );
      stats.chainid = Web3UI.Utils.getv( 'Web3UI_0network_chainid', "" );
      var done = false;
      var err = false;
      var delaysatisfied = false;
      var pendingerrmsg = "";
      var msgnum = 1;
      function savetxmsg( msg, cb, info ) {
        if (cb) {
          var tmp = cb( msg, info );
          msg = tmp ? tmp : msg;
        }
        Web3UI.Network._broadcasttx.posted[rawtx] = {'msg': msg};
      }
      function calccost( gasused, value ) {
        value = value == undefined ? stats.value : value;
        var msg = "";
        if (!gasused)
          return msg;
        var value = Web3UI.Network.web3.utils.toWei( value?value:'0.0', 'ether' );
        var c = Web3UI.Network.calccost( value, gasused, stats.gasprice );
        if (!c || c == "0")
          msg += gasused ? "<br/><span class='label'>Gas used: </span>"+gasused : "";
        else {
          msg += "<br/><span class='label'>Ether spent: </span>" + 
                 "<span class='selectable' onclick='Web3UI.Utils.select(this)'>" + c + "</span>";
          msg += gasused ? "<span class='label'> (gas used: </span>"+gasused+"<span class='label'>)</span>" : "";
        }
        return msg;
      }
      function onerror( errmsg ) {
        if (!done)
          if (delaysatisfied) {

//errmsg = 'Error: Error: reverted by EVM: "XgasUsed": 222 *"gasUsed":,ta;" "21501 666, dgsd: "gasUsedY":333 fg45s, dfg  46 m';  //4test

            errmsg = errmsg.toString();
            err = true;
            Web3UI.Network._broadcasttx.counts.pending--;
            Web3UI.Network._broadcasttx.counts.failed++;
            var gasused = Web3UI.Utils.extract( errmsg, '"gasUsed"' );
            if (errmsg.indexOf( 'revert' ) >= 0)
              errmsg = "Invalid parameter or not enough gas";
            errmsg = Web3UI.Utils.err( errmsg, "Failed" );
            errmsg = "<span class='txerr'>" + errmsg;
            errmsg += calccost( gasused, "0.0" );
            if (stats.gaslimit && gasused > (stats.gaslimit-500))
              errmsg += "<br/>May require gas limit increase";
            errmsg += "</span>";
            if (!savetxmsg( errmsg, callbacks.onerror ))
              msgnum = Web3UI.Network.addconsolemsg( stats.idmsg, errmsg, stats, msgnum, 'failed', Web3UI.Network._broadcasttx.counts );
            delete Web3UI.Network._broadcasttx.posted[rawtx];
            Web3UI.Network.chgconsoletitle( stats.idmsg, Web3UI.Network._broadcasttx.counts );
          }
          else
            pendingerrmsg = errmsg;
      }
      function onhash( hash ) {
        if (!done && !err) {
          stats.hash = hash ? hash : stats.hash;
          msg = "Sent";
          if (!savetxmsg( "Sent, waiting for confirmation...", callbacks.onwait, {'txhash':stats.hash} ))
            msgnum = Web3UI.Network.addconsolemsg( stats.idmsg, msg, stats, msgnum, 'almost', Web3UI.Network._broadcasttx.counts );
          Web3UI.Network.chgconsoletitle( stats.idmsg, Web3UI.Network._broadcasttx.counts );
        }
        console.log( ".once( transactionHash ): ", stats.hash );
      }
      function onconfirm( receipt ) {
        pendingerrmsg = "";
        receipt = receipt ? receipt : {blockNumber: stats.txnum, contractAddress: "0x00", gasUsed: 200};
        if (done) return;
        Web3UI.Network._broadcasttx.counts.pending--;
        done = true;
        var msg = "<span class='txreceipt'>";
        msg += "<span class='confirmed'>Confirmed, included in block " + receipt.blockNumber + "</span>";
        if (receipt.contractAddress)
          msg += "<br/><span class='label'>Contract deployed at address: </span>" + 
                      "<span class='url selectable' onclick='Web3UI.Utils.Qr.select(this)'>" + receipt.contractAddress + "</span>";
        msg += calccost( receipt.gasUsed );
        msg += "</span>";
        if (!savetxmsg( msg, callbacks.oncompletion, receipt ))
          msgnum = Web3UI.Network.addconsolemsg( stats.idmsg, msg, stats, msgnum, 'confirmed', Web3UI.Network._broadcasttx.counts );
        Web3UI.Network.chgconsoletitle( stats.idmsg, Web3UI.Network._broadcasttx.counts );
        console.log( ".then receipt: ", receipt );
      }
      function wait() {
        if (!done && !err) {
          delaysatisfied = true;
          if (pendingerrmsg)
            return onerror( pendingerrmsg );
          if (!savetxmsg( "Posted, waiting for reply...", callbacks.onwait ))
            msgnum = Web3UI.Network.addconsolemsg( stats.idmsg, "", stats, msgnum, 'pending', Web3UI.Network._broadcasttx.counts );
          Web3UI.Network.chgconsoletitle( stats.idmsg, Web3UI.Network._broadcasttx.counts );
        }
      }
      if (callbacks.onwait)
        savetxmsg( "Posted, waiting for reply...", callbacks.onwait );
      function send() {
        try {
          w3.eth.sendSignedTransaction( rawtx )
            .once( 'transactionHash', onhash )
            .on( 'error', onerror )
            .then( onconfirm );
        }
        catch( e ) {
          onerror( e );
        }
      }
      var w3 = null;
      try {
        w3 = Web3UI.Network.getconnection();
      }
      catch( e ) {
        return onerror( e );
      }

      setTimeout( send, Web3UI.debug ? 11000 : 100 );
      setTimeout( wait, 1000 );

      //setTimeout( onhash, 5000 );
      //setTimeout( onconfirm, 10000 );

      return true;
    }

  },

  /*** Account Wallet module ***/
  Wallet: {

      nonce: -1,
      rawtx: [""],

      // create default wallet file name
      createdefaultfilename: function( account ) {
        account = account ? account : Web3UI.Wallet.account;
        var a = account.address ? account.address : '----';
        return Web3UI.appname + "-wallet-" + a.slice(0,10) + "--" + a.slice(a.length-4) + ".txt";
      },

      // init save file ui
      init: function( offline, cansave ) {
        Web3UI.Utils.showeditmsg( 'Web3UI_0account_privatekey', Web3UI.Wallet.account.privateKey );
        Web3UI.Utils.showmsg( 'Web3UI_0account_privatekeyshow', /* "Private key: "+ */ Web3UI.Wallet.account.privateKey );
        Web3UI.Utils.showeditmsg( 'Web3UI_0account_address', /* "Address: "+ */ Web3UI.Wallet.account.address );
        Web3UI.Utils.showmsg( 'Web3UI_0account_addressshow', /* "Address: "+ */ Web3UI.Wallet.account.address );
        /* init save ui */
        var fn = Web3UI.Wallet.createdefaultfilename();
        Web3UI.Utils.showeditmsg( 'Web3UI_0account_savefilename', cansave?fn:"" );
        if (!offline)
          Web3UI.Wallet.getWalletInfo();
      },

      // create a wallet
      createkeypair: function( offline ) {
        Web3UI.Wallet.clr();
        Web3UI.Wallet.account = Web3UI.Network.web3.eth.accounts.create();
        Web3UI.Wallet.init( offline, true );
      },

      // open a wallet
      openkeypair: function( offline, cansave ) {
        Web3UI.Wallet.clr();
        var a;
        var pk = document.getElementById( 'Web3UI_0account_privatekey' ).value;
        try {
          a = Web3UI.Network.web3.eth.accounts.privateKeyToAccount( pk );
        }
        catch( e ) {
          return Web3UI.Utils.showerr( 'Web3UI_0account_openresponse', e );
        }
        Web3UI.Wallet.account = a;
        Web3UI.Wallet.init( offline, cansave );
        return a;
      },

      new: function( offline ) {
        Web3UI.Wallet.createkeypair( offline );
      },

      open: function( offline, cansave ) {
        var a = Web3UI.Wallet.openkeypair( offline, cansave );
        return a;
      },

      openfromfile: function( file, offline, cansave ) {
        function err( m ) {
          Web3UI.Wallet.clr();
          Web3UI.Utils.showeditmsg( 'Web3UI_0account_privatekey', "" );
          Web3UI.Utils.showerr( 'Web3UI_0account_openresponse', m );
        }
        function cb( w ) {
          if (w.privateKeyEncrypted) {
            var pass = ""; //Web3UI.Utils.getv( 'Web3UI_0account_pass' );
            if (pass == "password")
              pass = "";
            if (!pass) {
              pass = prompt( "Key is encrypted, password required:", "" );
              if (!pass)
                return err( "Private key is encrypted, password required" );
            }
            try {
              w.privateKey = Web3UI.Utils.decryptstr( w.privateKeyEncrypted, pass, "PK" );
            }
            catch( e ) {
              return err( "Decryption failed, wrong password or invalid file contents (" + e + ")" );
            }
            if (!w.privateKey)
              return err( "Decryption failed, check password" );
          }
          else
            if (!w.privateKey)
              return err( "File is invalid (no private key)" );
          if (!w.address)
            return err( "File is invalid (no address)" );
          Web3UI.Utils.showeditmsg( 'Web3UI_0account_privatekey', w.privateKey );
          if (!Web3UI.Wallet.openkeypair( true, cansave ))
            return err();
          if (w.address != Web3UI.Wallet.account.address)
            return err( "Decryption failed, check password" );
          Web3UI.Utils.showeditmsg( 'Web3UI_0account_savefilename', file.name );
          Web3UI.Utils.showeditmsg( 'Web3UI_0account_pass', "" );
          Web3UI.Utils.showeditmsg( 'Web3UI_0account_nonce', "" );
          if (!offline)
            Web3UI.Wallet.getWalletInfo();
        }
        Web3UI.Utils.openjsonfile( 'Web3UI_0account_openresponse', file, cb, err );
      },

      // save wallet to file
      savetofile: function( account ) {
        account = account ? account : Web3UI.Wallet.account;
        var id = 'Web3UI_0account_openresponse';
        if (!account)
          return Web3UI.Utils.showerr( id, "Create wallet first" );
        try {
          var w = {privateKey: account.privateKey, address: account.address};
          var pass = Web3UI.Utils.getv( 'Web3UI_0account_pass' );
          if (pass == "password")
            pass = "";
          if (pass) {
            w.privateKeyEncrypted = Web3UI.Utils.encryptstr( w.privateKey, pass, "PK" );
            if (w.privateKeyEncrypted)
              w.privateKey = "";
            else
              throw( "Encryption failed, wallet not saved" );
          }

          /*
          var e = document.getElementById( 'Web3UI_0account_save' );
          e.href = "data:text/plain," + JSON.stringify( w );
          var fn = Web3UI.Utils.getv( 'Web3UI_0account_savefilename' );
          if (!fn)
            fn = Web3UI.Wallet.createdefaultfilename( account );
          e.download = fn;
          e.click();
          */

          var fn = Web3UI.Utils.getv( 'Web3UI_0account_savefilename' );
          if (!fn)
            fn = Web3UI.Wallet.createdefaultfilename( account );
          Web3UI.Utils.savejsonfile( 'Web3UI_0account_save', fn, w );
        }
        catch( e ) {
          Web3UI.Utils.showerr( id, e );
        }
      },

      // on file name edit
      filenamechanged: function( account ) {
        account = account ? account : Web3UI.Wallet.account;
        var id = 'Web3UI_0account_openresponse';
        if (!account)
          return Web3UI.Utils.showerr( id, "Create wallet first" );
        var fn = Web3UI.Utils.getv( 'Web3UI_0account_savefilename' );
        if (!fn)
          Web3UI.Utils.showeditmsg( 'Web3UI_0account_savefilename', Web3UI.Wallet.createdefaultfilename(account) );
      },

      // get wallet object
      getWallet: function( idmsg ) {
        if (!idmsg)
          idmsg = 'Web3UI_0account_response';
        Web3UI.Utils.showmsg( idmsg, "waiting for reply..." );
        if (!Web3UI.Wallet.account)
          return Web3UI.Utils.showerr( idmsg, "Open wallet first" );
        return Web3UI.Wallet.account;
      },

      // get wallet info
      getWalletInfo: function() {
        var account = Web3UI.Wallet.getWallet();
        if (account)
          Web3UI.Network.getAddressInfo( 'Web3UI_0account', '', account.address );
      },

      // get balance of wallet address
      getBalance: function() {
        var account = Web3UI.Wallet.getWallet();
        if (account)
          Web3UI.Network.getAddressBalance( 'Web3UI_0account', account.address );
      },

      // get nonce of wallet address
      getNonce: function() {
        Web3UI.Wallet.clrwmsg();
        var account = Web3UI.Wallet.getWallet();
        if (account)
          Web3UI.Network.getAddressNonce( 'Web3UI_0account', account.address );
      },

      // get gas price
      getGasPrice: function() {
        Web3UI.Wallet.clrwmsg();
        Web3UI.Network.getGasPrice( 'Web3UI_0account' );
      },

      // sign a tx to send eth from wallet
      signAccountTx: function() {
        var id = 'Web3UI_0account';
        if (!Web3UI.Wallet.getWallet( id ))
          return;
        Web3UI.Wallet.rawtx[0] = "";
        var txdef = Web3UI.Interact.initTxDef( '0account' );
        if (!txdef)
          return;
        try {
          txdef.to = Web3UI.Utils.getv( 'Web3UI_0account_toaddress', '' );
          if (!txdef.to)
            throw( 'Recipient address required' );
          txdef.value = document.getElementById( 'Web3UI_0account_0pay' ).value;
          txdef.value = Web3UI.Network.web3.utils.toWei( txdef.value, 'ether' );
        }
        catch( e ) {
          return Web3UI.Utils.showerr( id, e );
        }
        return Web3UI.Interact.signtxdef( '0account', txdef, Web3UI.Wallet.rawtx, 0, 'payment' );
      },

      // send signed account tx
      sendAccountTx: function( rawtx ) {
        if (!rawtx)
          rawtx = Web3UI.Wallet.rawtx[0];
        Web3UI.Interact.sendrawtx( '0account', rawtx );
      },

      // save signed tx
      saveAccountTx: function( rawtx ) {
        if (!rawtx)
          rawtx = Web3UI.Wallet.rawtx[0];
        Web3UI.Interact.saverawtx( '0account', rawtx, 'payment' );
      },

      // clear msgs in transaction section
      clearAccountTxMsgs: function() {
        Web3UI.Wallet.rawtx[0] = "";
        Web3UI.Interact.cleartxmsgs( '0account' );
      },

      // clear wallet kaput
      clr: function() {
        Web3UI.Wallet.account = null;
        Web3UI.Wallet.clrwmsg();
        Web3UI.Utils.clearmsgs( ['Web3UI_0account_privatekeyshow',
                                 'Web3UI_0account_addressshow',
                                 'Web3UI_0account_openresponse'] );
        Web3UI.Utils.showeditmsg( 'Web3UI_0account_address', "" );
        Web3UI.Utils.showeditmsg( 'Web3UI_0account_nonce', "" );
        Web3UI.Utils.showeditmsg( 'Web3UI_0account_balance', "" );
        Web3UI.Utils.showeditmsg( 'Web3UI_0account_savefilename', "" );
      },

      // clear wallet msgs and tx msgs for updated signing info
      clrwmsg: function() {
        Web3UI.Wallet.clearAccountTxMsgs();
        Web3UI.Interact.clearmsgs();
        Web3UI.Utils.showmsg( 'Web3UI_0account_response', "" );
      }

  },

  /*** Housekeeping functions ***/
  Utils: {

      // process error
      err: function( msg, pfx ) {
        if (!msg)
          return msg;
        msg = msg.toString();
        var newmsg = false;
        if (msg.slice(0,35) == "Error: Signer Error: Signer Error: ")
          msg = msg.slice( 35 );
        if (msg.slice(0,23) == "Error: Returned Error: ")
          msg = msg.slice( 23 );
        if (msg.indexOf( "Returned values aren't valid, did it run Out of Gas?" ) >= 0)
          msg = "There may be no contract at specified address on current network", newmsg = true;
                //, or function not supported (possible ABI/contract type mismatch)";
        if (msg == 'Error: Invalid JSON RPC response: ""')
          msg = "No internet or network unresponsive", newmsg = true;
        if (msg.slice(0,29) == "Error: invalid arrayify value")
          msg = "Data (bytes, etc.) arguments are hexidecimal strings preceeded by '0x';" + 
                " function arguments also require special handling (response was: " + msg + ")", newmsg = true;
        //msg = newmsg ? msg : "response was: " + msg;
        msg = pfx ? (pfx+" (" + msg + ")") : msg;
        return "<span class='failed'>" + msg + "</span>";
      },

      // show a msg on page
      showerr: function( id, msg, pfx ) {
        if (msg) console.log( msg );
        msg = Web3UI.Utils.err( msg, pfx );
        Web3UI.Utils.showmsg( id, msg );
      },

      confirmed: function( msg, pfx ) {
        msg = msg == undefined ? '""' : msg.toString();
        msg = pfx ? (pfx+" (" + msg + ")") : msg;
        return "<span class='confirmed'>" + msg + "</span>";
      },

      // toggle targeted foldpane on page
      togglefoldpane: function( id, newval ) {
        var paneid = id+'_foldpane';
        if (document.getElementById( paneid ))
          if (newval)
            Web3UI.Utils.unfold( paneid );
          else
            Web3UI.Utils.fold( paneid );
      },

      // show a msg on page
      showmsg: function( id, msg ) {
        //if (msg) console.log( msg );
        if (document.getElementById( id )) {
          document.getElementById( id ).innerHTML = msg;
          Web3UI.Utils.togglefoldpane( id, msg );
        }
      },

      // set inner HTML
      setin: function( id, i ) {
        //if (document.getElementById( id )) document.getElementById( id ).innerHTML = i;
        Web3UI.Utils.showmsg( id, i );
      },

      // clear msgs on page
      clearmsgs: function( ids ) {
        for( var i=0; i<ids.length; i++ )
          Web3UI.Utils.showmsg( ids[i], "" );
      },

      // show a msg in input
      showeditmsg: function( id, msg ) {
        //console.log( msg );
        if (document.getElementById( id )) {
          document.getElementById( id ).value = msg;
          Web3UI.Utils.togglefoldpane( id, msg );
        }
      },

      // get inner of elem
      getmsg: function( id, defaultmsg ) {
        var e = document.getElementById( id );
        if (e && e.innerHTML) return e.innerHTML;
        return defaultmsg;
      },

      // get elem
      gete: function( id ) {
        return document.getElementById( id );
      },

      // enable/disable elem
      en: function( id, ena ) {
        var e = document.getElementById( id );
        if (e)
          e.disabled = !ena;
      },

      // get value of elem
      getv: function( id, defaultv ) {
        var e = document.getElementById( id );
        if (e && e.value) return e.value;
        return defaultv;
      },

      // set value of elem
      setv: function( id, v ) {
        //var e = document.getElementById( id );
        //if (e) e.value = v;
        Web3UI.Utils.showeditmsg( id, v );
      },

      // move section of HTML
      movesec: function( idfrom, idto ) {
        var efrom = document.getElementById( idfrom );
        var eto = document.getElementById( idto );
        if (efrom && eto ) {
          eto.appendChild( efrom );
        }
      },

      el: function( id ) {
        var e = null;
        if (id)
          if (id instanceof HTMLElement)
            e = id;
          else
            e = document.getElementById( id );
        return e;
      },

      scrolltobottom: function( id ) {
        var e = Web3UI.Utils.el( id );
        if (e)
          //e.scrollTop = 100000000;
          e.lastElementChild.scrollIntoView( {behavior: "smooth"} );
      },

      select: function( id ) {
        var e = Web3UI.Utils.el( id );
        if (e)
          window.getSelection().selectAllChildren( e );
      },

      firemouseev: function( id, evn ) {
        var e = Web3UI.Utils.el( id );
        if (e) {
          var ev = new MouseEvent( evn, {view: window, bubbles: true, cancelable: true} );
          e.dispatchEvent( ev );
        }
      },

      input: function( id, v ) {
        var e = Web3UI.Utils.el( id );
        if (e) {
          e.value = v;
          Web3UI.Utils.firemouseev( e, 'input' );
        }
      },

      getparent: function( id ) {
        var e = Web3UI.Utils.el( id );
        return (e && e.parentElement) ? e.parentElement : null;
      },

      unfold: function( idfoldpane, scrollto ) {
        Web3UI.Utils.class.replace( idfoldpane, 'closed', 'opened' );
        if (scrollto)
          Web3UI.Utils.el(idfoldpane).scrollIntoView( {behavior: "smooth"} );
      },

      fold: function( idfoldpane ) {
        Web3UI.Utils.class.replace( idfoldpane, 'opened', 'closed' );
      },

      // int to big int
      toBN: function( n ) {
        return Web3UI.Network.web3.utils.toBN( n );
      },

      // mult ints to big int
      multBN: function( n, m ) {
        n = Web3UI.Utils.toBN( n );
        m = Web3UI.Utils.toBN( m );
        return n.mul( m );
      },

      // mult ints to big int
      addBN: function( n, m ) {
        n = Web3UI.Utils.toBN( n );
        m = Web3UI.Utils.toBN( m );
        return n.add( m );
      },

      // skip until char in string
      skip: function( s, untilchars, i, skipto ) {
        i = i ? i : 0;
        function ismatch( c, chars ) {
          for( var j=0; j<chars.length; j++ )
            if (c == chars[j])
              return true;
        }
        for( ; i<s.length; i++ )
          if (ismatch( s[i], untilchars )) {
            if (skipto)
              break;
          }
          else
            if (!skipto)
              break;
        return i;
      },

      // extract a tokens value in string, "..."token": "value"..."
      extract: function( s, token, matchchars, exclude ) {
        if (exclude)
          matchchars = matchchars ? matchchars : ['"', ' ', ';',':', "'"];
        else
          matchchars = matchchars ? matchchars : ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        var v = "";
        var i = s.toUpperCase().indexOf( token.toUpperCase() );
        if (i >= 0) {
          i += token.length;
          i = Web3UI.Utils.skip( s, matchchars, i, !exclude );
          var j = Web3UI.Utils.skip( s, matchchars, i, exclude );
          v = s.slice( i, j );
        }
        return v;
      },

      // replace all instances of a token in string
      replacetoks: function( s, token, replacewith ) {
        var sout = s;
        do {
          s = sout;
          sout = s.replace( token, replacewith );
        }
        while (s != sout);
        return sout;
      },

      // replace all occurances of tokens in string [{token:"T",replacewith:"W"}, ...]
      replace: function( s, tokens ) {
        for( var i=0; i<tokens.length; i++ )
          s = Web3UI.Utils.replacetoks( s, tokens[i].token, tokens[i].replacewith );
          /*
          for( var j=0; j<tokens[i].count; j++ )
            s = s.replace( tokens[i].token, tokens[i].replacewith );
          */
        return s;
      },

      // copy mem
      copymem: function( o ) {
        return JSON.parse( JSON.stringify(o) );
      },

      /*function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
      },*/

      // make data url
      __lastobjurl: null,
      todataurl: function( mimetype, content ) {
        if (Web3UI.Utils.__lastobjurl)
          URL.revokeObjectURL( Web3UI.Utils.__lastobjurl );
        var b = new Blob( [content], {type:mimetype} );
        Web3UI.Utils.__lastobjurl = URL.createObjectURL( b );
        return Web3UI.Utils.__lastobjurl;
      },

      savedataurl: function( id, fn, mimetype, content ) {
        console.log( content );
        var e = Web3UI.Utils.el( id );
        e.download = fn;
        e.href = Web3UI.Utils.todataurl( mimetype, content );
        e.click();
      },

      savetextfile: function( id, fn, content ) {
        Web3UI.Utils.savedataurl( id, fn, 'text/plain', content );
      },

      savejsonfile: function( id, fn, contents ) {
        Web3UI.Utils.savetextfile( id, fn, JSON.stringify(contents) );
      },

      // activate <input type='file'> for user to select file(s)
      selfile: function( idinp ) {
        var e = Web3UI.Utils.gete( idinp );
        e.value = "";
        e.click();
      },

      // open text file
      opentextfile: function( id, file, callback, onerror, rejectjson, muststartwith ) {
        if (!file)
          return;
        var reader = new FileReader();
        reader.onerror = function( e ) {if (!onerror(e)) Web3UI.Utils.showerr(id,e);}
        reader.onload = function( e ) {
          var t = e.target.result;
          if (rejectjson) {
            try {
              t = JSON.parse( t );
              return reader.onerror( "Invalid file contents (JSON)" );
            }
            catch( e ) {
            }
          }
          if (muststartwith && t.slice(0,muststartwith.length) != muststartwith)
            return reader.onerror( "Invalid file contents (must start with '" + muststartwith + "')" );
          callback( t );
        }
        reader.readAsText( file );
      },

      // open json file
      openjsonfile: function( id, file, callback, onerror, params ) {
        params = params ? params : {};
        function err( msg ) {
          if (!onerror( msg ))
            Web3UI.Utils.showerr( id, msg );
          return true;
        }
        function cb( text ) {
          var json;
          try {
            json = JSON.parse( text );
            if (params.mustcontain && !json[params.mustcontain])
              return err( "Invalid JSON file ('" + params.mustcontain + "' expected in content)" );
          }
          catch( e ) {
            if (params.textok && params.textok.muststartwith) {
              if (text.slice(0,params.textok.muststartwith.length) != params.textok.muststartwith)
                return err( "File contents not recognized (must be JSON or start with '" + params.textok.muststartwith + "')" );
            }
            else
              return err( "Invalid file contents (JSON text expected)" );
            json = null;
          }
          callback( json, text );
        }
        return Web3UI.Utils.opentextfile( id, file, cb, err );
      },

      // encrypt string with AES256
      encryptstr: function( plain, pass, pfx ) {
        if (!pfx) pfx = "";
        var cipher = plain;
        if (CryptoJS && CryptoJS.AES) {
          var cipher = CryptoJS.AES.encrypt( pfx+plain, pass );
          cipher = cipher.toString();
        }
        //console.log( "CIPHER:", cipher );
        return cipher;
      },

      // decrypt cipher-string with AES256
      decryptstr: function( cipherstr, pass, pfx ) {
        if (!pfx) pfx = "";
        var plain = "";
        if (CryptoJS && CryptoJS.AES) {
          plain = CryptoJS.AES.decrypt( cipherstr, pass );
          plain = plain.toString( CryptoJS.enc.Utf8 );
          if (pfx) {
            if (plain.slice(0,pfx.length) != pfx)
              plain = "";
            else
              plain = plain.slice( pfx.length );
          }
        }
        return plain;
      }

  }
}

Web3UI.Utils.class = { 
  has: function( id, cls ) {
    var e = Web3UI.Utils.el( id );
    return (e && cls && e.classList.contains( cls ));
  },
  rem: function( id, cls ) {
    var e = Web3UI.Utils.el( id );
    if (e && cls)
      if (e.classList.contains( cls ))
        e.classList.remove( cls );
  },
  add: function( id, cls ) {
    var e = Web3UI.Utils.el( id );
    if (e && cls)
      if (!e.classList.contains( cls ))
        e.classList.add( cls );
  },
  replace: function( id, cls1, cls2 ) {
    var e = Web3UI.Utils.el( id );
    if (e) {
      Web3UI.Utils.class.rem( e, cls1 );
      Web3UI.Utils.class.add( e, cls2 );
    }
  }
}

Web3UI.Utils.Qr = {
  gen: function( id ) {
    if (!(typeof QRIO === 'undefined')) {
      Web3UI.Utils.Qr.__qrg = Web3UI.Utils.Qr.__qrg ? Web3UI.Utils.Qr.__qrg : new QRIO.Generator();
      Web3UI.Utils.Qr.__qrg.open( Web3UI.Utils.el(id) );
    }
  },
  scan: function( id ) {
    if (!(typeof QRIO === 'undefined')) {
      Web3UI.Utils.Qr.__qrr = Web3UI.Utils.Qr.__qrr ? Web3UI.Utils.Qr.__qrr : new QRIO.Reader();
//Web3UI.Utils.Qr.__qrr._settestpolyfill();
      Web3UI.Utils.Qr.__qrr.open( Web3UI.Utils.el(id) );
      Web3UI.Utils.firemouseev( id, 'input' );
    }
  },
  select: function( e ) {
    Web3UI.Utils.select( e );
    Web3UI.Utils.Qr.gen( e );
  }
}

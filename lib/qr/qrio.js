/*
 * QrioJS v0.10, QR Code Generator Widgets/QR and Bar Code Scanner Widgets
 *   July 2023, MIT License, project @ github/gregsidal
 *
 * Uses qrcode.js from github/kazuhikoarase
 * Detector code adapted from github/kazuhikoarase
 *
 * To use widgets in a page, include qrio.css/qrcode.js/qrio.js, and place at bottom of HTML:
 *   <div id="qrio-generator-html"></div>
 *   <div id="qrio-reader-html"></div>
 *
 * During page init (onload or onDOMContentLoaded) call:
 *   QRIO.generator.insertHTML();
 *   QRIO.reader.insertHTML();
 *
 * See QRIO.generator.HTML/QRIO.reader.HTML for default HTML; see qrio.css for default css
 *
 * To generate a QR code:
 *   QRIO.generator.open( message[, opts] );  // message is HTMLElement or string containing message to encode
 *
 * To scan QR and/or bar codes:
 *   QRIO.reader.open( message[, callback] );  // message is HTMLElement to receive message(s), can be null
 *     callback( messages )  // messages is an array of strings containing selected message(s)
 *
 * To create specific widget instances:
 *
 * QRIO.Generator:
 *   init:    var qrg = new QRIO.Generator()
 *   open:    qrg.open( message[, opts] )     // message is an HTMLElement or a string 
 *   gen:     qrg.gen( message[, opts] )      // returns gif data url (no ui), message is string
 *
 * QRIO.Reader: 
 *   init:    var qrr = new QRIO.Reader()
 *   start:   qrr.open( message[, callback] ) // message is HTMLElement (can be null)
 *
 * ID name construction:
 *   appid + funid[module] + suffix
 *
 * To set name prefixes (when using non-default html/css):
 *   QRIO.setappid( appid );           //default 'qrio-'
 *   QRIO.setfunid( 'g'|'r', funid );  //defaults 'generator-' and 'reader-'
 *
 * If browser doesn't support the native BarcodeDetector API:
 *   QRIO.reader.detectorPolyfill will be used instead if defined
 *   (a 'BarcodeDetectorPolyfill' module is available from private com, license may be required)
 */

/*
General
*/
var QRIO = {

  _debug: false,
  appid: 'qrio-',
  funids: {g: 'generator-', r: 'reader-'},
  setappid: function( aid ) {if (aid) QRIO.appid = aid;},
  setfunid: function( fn, fid ) {if (fid) QRIO.funids[fn] = fid;},

  fullid: function( fn, id ) {return QRIO.appid + QRIO.funids[fn] + id;},
  e: function( fn, id ) {
    var fullid = QRIO.fullid( fn, id );
    return document.getElementById( fullid );
  },
  pute: function( e, res ) {
    if (e)
      if ((e instanceof HTMLInputElement) || (e instanceof HTMLTextAreaElement))
        e.value = res;
      else
        e.innerHTML = res;
  },
  put: function( fn, id, res ) {
    console.log( res );
    var e = QRIO.e( fn, id );
    QRIO.pute( e, res );
  },
  gete: function( e ) {
    if (e)
      if ((e instanceof HTMLInputElement) || (e instanceof HTMLTextAreaElement))
        return e.value;
      else
        return e.innerHTML;
  },
  get: function( fn, id ) {
    var e = QRIO.e( fn, id );
    return QRIO.gete( e );
  },
  classname: function( cn ) {return QRIO.appid + cn;},
  remclass: function( fn, id, cn ) {QRIO.e(fn,id).classList.remove( QRIO.classname(cn) );},
  addclass: function( fn, id, cn ) {QRIO.e(fn,id).classList.add( QRIO.classname(cn) );},
  open: function( fn, id ) {QRIO.remclass( fn, id, 'closed' );},
  close: function( fn, id ) {QRIO.addclass( fn, id, 'closed' );},
  showres: function( fn, res ) {QRIO.put( fn, 'status', res );},
  debug: function( fn, msg ) {
    if (QRIO._debug) {
      console.log( msg );
      QRIO.e( fn, 'status' ).innerHTML += "<br/><br/>" + msg;
    }
  }
};

/*
Encoders
*/
QRIO.generator = {
  open: function( message, opts ) {
    QRIO.generator.__qrg = QRIO.generator.__qrg ? QRIO.generator.__qrg : new QRIO.Generator();
    QRIO.generator.__qrg.open( message, opts );
  },
  html:
    '<div id="qrio-generator-home" class="qrio-widget qrio-closed">' +
      '<div class="qrio-controls">' +
        '<div id="qrio-generator-status" class="qrio-status">Initializing...</div>' +
        '<button id="qrio-generator-exitbtn" class="qrio-exitbtn">Done</button>' +
      '</div>' +
      '<div class="qrio-imgwrap">' +
        '<img class="qrio-img qrio-fitted" id="qrio-generator-img"/>' +
      '</div>' +
    '</div>',
  insertHTML: function() {QRIO.put( 'g', 'html', QRIO.generator.html );}
}

/* 
Encoder and viewer
*/
QRIO.Generator = function() {

  function showres( res ) {QRIO.showres( 'g', res );}
  function debug( msg ) {QRIO.debug( 'g', msg );}

  var img = QRIO.e( 'g', 'img' );
  var exitbtn = QRIO.e( 'g', 'exitbtn' );
  exitbtn.onclick = function() {close();}

  /* encode message and show it in view box */
  this.open = function( message, inopts ) {
    var idu;
    try {
      var text = message;
      if (message instanceof HTMLElement)
        text = QRIO.gete( message );
      if (!text)
        return alert( "Provide message to encode" );
      idu = this.gen( text, inopts );
      img.src = idu;
      var tmsg = text;
      if (inopts && inopts.maxtextviewlen)
        tmsg = text.length > inopts.maxtextviewlen ? 
          (text.slice(0,inopts.maxtextviewlen/3) + ".." + text.slice(text.length-(inopts.maxtextviewlen/3))) : text;
      showres( tmsg );
      QRIO.open( 'g', 'home' );
    }
    catch( e ) {
      var es = 'QRcode generation failed (response was: "' + e + '")';
      if (es.indexOf( "overflow" ) >= 0)
        es += ". The message may be too large to fit into a QR code.";
      alert( es );
    }
    return idu;
  }
  var close = function() {
    QRIO.close( 'g', 'home' );
  }
  this.close = function() {return close();}

  /* encode message and return data url of gif */
  this.gen = function( text, inopts ) {
    if (!text)
      throw( "No message to encode" );
    var opts = inopts ? inopts : {};
    opts = {
        typeNumber: opts.typeNumber ? opts.typeNumber : '0',
        errorCorrectionLevel: opts.errorCorrectionLevel ? opts.errorCorrectionLevel : 'M', 
        mode: opts.mode ? opts.mode : 'Byte', 
        mb: opts.mb ? opts.mb : 'UTF-8', 
        sizepx: opts.sizepx ? opts.sizepx : 0,
        margin: opts.margin ? opts.margin : 0,
        cellsize: opts.cellsize ? opts.cellsize : 8
    };
    /* encode */
    qrcode.stringToBytes = qrcode.stringToBytesFuncs[opts.mb];
    var qr = qrcode( opts.typeNumber || 4, opts.errorCorrectionLevel || 'M' );
    //text = text.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    qr.addData( text, opts.mode );
    qr.make();
    /* gen image*/
    /*
    if (opts.sizepx && opts.sizepx > window.innerWidth)  //must be entirely visible w/o scrolling
      opts.sizepx = window.innerWidth;
    if (opts.sizepx && opts.sizepx > window.innerHeight)  //must be entirely visible w/o scrolling
      opts.sizepx = window.innerHeight;
    */
    opts.cellsize = opts.sizepx ? Math.floor(opts.sizepx/qr.getModuleCount()) : opts.cellsize;
    opts.margin = opts.cellsize; 
    return qr.createDataURL( opts.cellsize, opts.margin );
  }
}

/*
Reader widgets
*/
QRIO.reader = {
  open: function( e, callback ) {  // global reader
    QRIO.reader.__qrr = QRIO.reader__qrr ? QRIO.reader.__qrr : new QRIO.Reader();
    QRIO.reader.__qrr.open( e, callback );
  },
  html:
    '<div id="qrio-reader-home" class="qrio-widget qrio-closed">' +
      '<div class="qrio-imgwrap qrio-scroll">' +
        '<img id="qrio-reader-selectedimg" class="qrio-img qrio-closed"/>' +
        '<svg id="qrio-reader-svgoverlay" class="qrio-overlay qrio-img qrio-closed"></svg>' +
      '</div>' +
      '<div class="qrio-controls">' +
        '<label for="qrio-reader-camerainput" id="qrio-reader-camerainputlabel">Camera</label>' +
        '<input id="qrio-reader-camerainput" type="file" accept="image/*" capture/>' +
        '<button id="qrio-reader-exitbtn" class="qrio-exitbtn">Done</button>' +
        '<div id="qrio-reader-status" class="qrio-status">Initializing...</div>' +
      '</div>' +
      '<input id="qrio-reader-fileinput" type="file" accept="image/*"/>' +
    '</div>',
  insertHTML: function() {QRIO.put( 'r', 'html', QRIO.reader.html );},
  alerts: {
    nodetector: 
        "Browser lacks support for QR and bar code scanning. " + 
        "Try Chrome on Android (most recent version), or use  " + 
        "a native app that can scan codes to clipboard.",
    nodetectorshort: 
        "No detection capability in browser",
    nofile:
        "Failed to open file or camera",
    ready: 
        "Use camera to snap photo to be scanned for QR and bar codes " +
        "(camera capture is generally only available on mobile devices).  " +
        "Photos can also be opened from files.",
    notanimg: 
        "Image not recognized"
  },
  setalerts: function( m ) {QRIO.reader.alerts = m;},
  detectorPolyfill: undefined,
  setpolyfill: function( p ) {QRIO.reader.detectorPolyfill = p;},
  multisel: false,
  setmultisel: function( m ) {QRIO.reader.multisel = m;},
  msgcache: {},
  msgcacheclr: function( m ) {QRIO.reader.msgcache = {};}, 
  msgcacheadd: function( m, id ) {QRIO.reader.msgcache[m] = id;},
  chkone: function( chkindex ) {
    if (!QRIO.reader.multisel)
      for( var i=0, e=true; e; i++ ) {
        e = QRIO.e( 'r', 'check'+i );
        if (e && i != chkindex && e.checked)
          e.checked = false;
      }
  },
  sel: function( selindex ) {
    e = QRIO.e( 'r', 'check'+selindex );
    if (e) {
      e.checked = !e.checked;
      QRIO.reader.chkone( selindex );
    }
  }
}

/*
Specific Reader widget
*/
QRIO.Reader = function() {

  function showres( res ) {QRIO.showres( 'r', res );}
  function debug( msg ) {QRIO.debug( 'r', msg );}
  function el( id ) {return QRIO.e( 'r', id );}

  this.setmultisel = function( m ) {
    if (QRIO.reader.multisel != m) {
      QRIO.reader.setmultisel( m );
      if (!m)
        QRIO.reader.chkone();
    }
  }

  this._settestpolyfill = function() {  //set a polyfill 4 crude testing on device w/o BarcodeDetector
    var _testbarcodes = [
      {cornerPoints: [{x:10, y:10},{x:150, y:10},{x:150, y:150},{x:10, y:150}],
       rawValue: "This is only a test, do not be alarmed"},
      {cornerPoints: [{x:160, y:10},{x:260, y:10},{x:270, y:150},{x:160, y:150}],
       rawValue: "https://github.com/gregsidal"}
      /*,{cornerPoints: [{x:160, y:10},{x:260, y:10},{x:270, y:150},{x:160, y:150}],
       rawValue: "This is just another test, still no cause for alarm "},
      {cornerPoints: [{x:10, y:200},{x:310, y:200},{x:290, y:290},{x:10, y:310}],
       rawValue: "0xfa8680013030d4194ec0b90e2c676db7115c4e40b66579c0a88025a049fca3030439eaa6e892154d0588" + 
                 "fef8aecb3ab239304fcd740a8f7228e23050a07ffb4a1845b9f95ea9c4285dab2e39d2385e4f48d06cf413"}*/
    ];
    var _case = 1;
    QRIO.reader.setpolyfill( 
      function() { 
        this.detect = async function( img ) { 
          _testbarcodes[0].rawValue += "__" + _case;
          //_testbarcodes[1].rawValue += "__" + _case;
          _case++;
          return _testbarcodes;
        }
      } 
    );
  }

  var exitbtn = el( 'exitbtn' );
  exitbtn.onclick = function() {close();}
  var barcode_detector;

  async function initdetector() {
    if (barcode_detector)
      return;
    var bcd;
    if ('BarcodeDetector' in window) {
      let formats = await window.BarcodeDetector.getSupportedFormats();
      if (formats.length > 0)
        bcd = window.BarcodeDetector;
    }
    else
      if (QRIO.reader.detectorPolyfill)
        bcd = QRIO.reader.detectorPolyfill;
      else
        return showres( QRIO.reader.alerts.nodetector );
    if (bcd) {
      barcode_detector = new bcd();
      showres( QRIO.reader.alerts.ready );
    }
  }

  var messagereceiver, callback;
  this.open = function( message, cb ) {
    try {
      cameraInput.value = fileInput.value = "";
      messagereceiver = message;
      callback = cb;
      initdetector();
      QRIO.open( 'r', 'home' );
    }
    catch( e ) {
      alert( 'Reader failed to run (response was: "' + e + '")' );
    }
  }
  var close = function() {
    var e = true, msgs = [];
    for( var i=0; e; i++ ) {
      e = el( 'check'+i );
      if (e && e.checked)
        msgs.push( QRIO.get('r','msg'+i) );
    }
    QRIO.close( 'r', 'home' );
    if (callback)
      if (callback( msgs ))
        return msgs;
    var msgstr = "";
    if (msgs.length)
      if (msgs.length == 1)
        msgstr = msgs[0];
      else
        msgstr = JSON.stringify( msgs, null, 2 );
    if (msgstr)
      QRIO.pute( messagereceiver, msgstr );
    return msgs;
  }
  this.close = function() {return close();}

  /* open image file and detect it */
  var cameraInput = el( 'camerainput' );
  var fileInput = el( 'fileinput' );
  cameraInput.onchange = fileInput.onchange = function( event ) {
    var file = event.target.files[0];
    if (!file)
      return;
    var reader = new FileReader();
    reader.onload = function( e ) {
      var img = el( 'selectedimg' );
      img.onerror = function() {
        cameraInput.value = fileInput.value = ""
        showdetect( false );
        showres( QRIO.reader.alerts['notanimg'] );
      }
      img.onload = async function() {
        clrOverlay();
        showdetect( true );
        if (!barcode_detector)
          return showres( QRIO.reader.alerts['nodetectorshort'] );
        var detectedCodes = await barcode_detector.detect( img );
        var json = JSON.stringify( detectedCodes, null, 2 );
        debug( json );
        setupOverlay( img );
        var o = {t:{x:img.naturalWidth,y:0}, flipaxes:true, s:{x:-1,y:1}};
        if (img.naturalWidth > img.naturalHeight)
          o = null;
        drawOverlay( detectedCodes, o );
        showMessages( detectedCodes );
      }
      img.src = e.target.result;
      //cameraInput.value = fileInput.value = this.value;
    }
    reader.onerror = function () {
      alert( QRIO.reader.alerts['nofile'] );
      showres( "" );
    }
    reader.readAsDataURL( file );
  }

  function showdetect( show ) {
    if (show)
      QRIO.open( 'r', 'selectedimg' ), QRIO.open( 'r', 'svgoverlay' );
    else
      QRIO.close( 'r', 'selectedimg' ), QRIO.close( 'r', 'svgoverlay' );
  }

  /* show messages with checkboxes */
  function showMessages( barcodes ) {
    for ( var m in QRIO.reader.msgcache )
      QRIO.reader.msgcache[m] = 99999;
    var msg = "<div class='" + QRIO.classname('msglist') + "'>";
    msg += barcodes.length ? "Messages extracted:" : "No codes recognized in image";
    for ( var i=0; i<barcodes.length; i++ )
      QRIO.reader.msgcacheadd( barcodes[i].rawValue, i % 5 );
    i = 0; var newmsgs = 0;
    for ( m in QRIO.reader.msgcache ) {
      if (QRIO.reader.msgcache[m] != 99999)
        newmsgs++;
      msg += drawMessageHTML( m, i, QRIO.reader.msgcache[m], (newmsgs == 1 && QRIO.reader.msgcache[m] != 99999) );
      i++;
    }
    msg += "</div>";
    showres( msg );
  }
  function drawMessageHTML( message, i, cn, chk ) {
    var c = " " + QRIO.classname('c') + cn;
    var msg = "<div class='" + QRIO.classname('extracted') + " " + QRIO.classname('msg') + c + "'/>";
    var id = "'" + QRIO.fullid( 'r', 'check'+i ) + "'";
    msg += '<input type="checkbox" ' +
           "id=" + id + (chk ? " checked " : "") + 
           'onclick="QRIO.reader.chkone(' + i + ')" '  +
           "class='" + QRIO.classname('check') + c + "'" + "/>";
    var chkid = id;
    var id = "'" + QRIO.fullid( 'r', 'msg'+i ) + "'";
    msg += "<span class='" + QRIO.classname('msg') + c + "' " +
           "id=" + id + 
           'onclick="QRIO.reader.sel(' + i + ')"'  +
           ">" + message + '</span>';
    if (message.slice(0,8) == "https://")
      msg += " <a href='" + message + "' class='" + QRIO.classname('target') + c + "' target=_blank></a>";
    return msg + "</div>";
  }

  /* machinery for svg overlay (to visually show detected codes)*/
  var svg = el( 'svgoverlay' );
  function setupOverlay( img ) {
    clrOverlay();
    if (!img.naturalWidth)
      return;
    var vb = "0 0 " + img.naturalWidth + " " + img.naturalHeight;
    debug( "svg viewBox: " + vb );
    svg.setAttribute( "viewBox", vb );
  }
  function clrOverlay() {
    svg.innerHTML = "";
  }
  function drawOverlay( barcodes, origin ) {
    svg.innerHTML = "";
    for ( var i=0; i<barcodes.length; i++ ) {
      var barcode = barcodes[i];
      var points = getPointsData( barcode.cornerPoints, origin );
      var polygon = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
      polygon.setAttribute( "points", points );
      var c = " " + QRIO.classname('c') + (i % 5);
      polygon.setAttribute( "class", QRIO.classname('extracted') + c );
      svg.append( polygon );
      debug( "points: " + points );
      var text = document.createElementNS( "http://www.w3.org/2000/svg", "text" );
      text.innerHTML = barcode.rawValue;
      var txtpt = getMinPoint( barcode.cornerPoints, origin );
      text.setAttribute( "x", txtpt.x );
      text.setAttribute( "y", txtpt.y );
      text.setAttribute( "fill", "red" );
      text.setAttribute( "fontSize", "200" );
      //svg.append( text );
      debug( "text point: " + txtpt.x + "," + txtpt.y );
    }
  }
  function getPointsData( pts, origin ) {
    var pointsData = 
          getPointData(pts[0],origin) + " " +
          getPointData(pts[1],origin) + " " +
          getPointData(pts[2],origin) + " " +
          getPointData(pts[3],origin);
    return pointsData;
  }
  function getPointData( pt, origin ) {
    pt = getVwPoint( pt, origin );
    var ptData = pt.x + "," + pt.y;
    return ptData;
  }
  function getVwPoint( pto, origin ) {
    origin = origin ? origin : {t:{x:0,y:0}, flipaxes:false, s:{x:1,y:1}};
    var pt = pto;
    if (origin.flipaxes)
      pt = {x:pto.y, y:pto.x};
    return {x:origin.t.x + (pt.x*origin.s.x), y:origin.t.y + (pt.y*origin.s.y)};
  }
  function getMinPoint( pts, origin ) {
    var pt, minpt = {x:9999999,y:9999999};
    for( var i=0; i<pts.length; i++ ) {
      pt = getVwPoint( pts[i], origin );
      if (pt.x < minpt.x)
        minpt.x = pt.x;
      if (pt.y < minpt.y)
        minpt.y = pt.y;
    }
    return minpt;
  }

};

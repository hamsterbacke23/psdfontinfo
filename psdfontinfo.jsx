var LAYERSETNAME = 'sb_fontmeta_group';
var LAYERNAME = 'sb_fontmetainfo_layer';
var TEXTLAYERS = [];
var RESULTTXT = '';


function recurseLayers(currLayers)
{
   for(var i = 0; i < currLayers.layers.length; i++)
   {
          if (currLayers.layers[i].visible && currLayers.layers[i].kind === LayerKind.TEXT) {
                TEXTLAYERS.push(currLayers.layers[i]);
           }

      //test if it's a layer set
      if(isLayerSet(currLayers.layers[i]))
      {
         recurseLayers(currLayers.layers[i]);
      }
   }
}

//a test for a layer set
function isLayerSet(layer)
{
   try{
      if(layer.layers.length > 0)
         return true;}

   catch(err){
      return false;}
}


function createFontMetaLayer(layer, i, targetLayerSet)  {

    if (!layer || layer.kind !== LayerKind.TEXT || !layer.textItem ) {
        return;
    }

    var fontName;
    try{
       fontName = layer.textItem.font;
    }catch(e){
       fontName = 'fn: ?';
       $.writeln('font property not found');
    }

    var fontSize;
    try{
       fontSize = layer.textItem.size;
    }catch(e){
        $.writeln(FontSize);
       fontSize = 'fs: ?';
       $.writeln('size property not found');
    }


    var fontWeight;
    try{
       fontWeight = layer.textItem.fauxBold;
    }catch(e){
       fontWeight = '';
    }

   var fontStyle;
    try {
     fontStyle = layer.textItem.fauxItalic;
    } catch(e) {
       fontStyle = '';
    }

   var fontColor;
   try {
      fontColor = '#' + layer.textItem.color.rgb.hexValue;
    } catch(e) {
      fontColor = '';
    }


   var contents;
   try {
      contents =  layer.textItem.contents ? "\r\ncontent:\r\n" + layer.textItem.contents : '';
    } catch(e) {
      contents = '';
    }


    var layerPosition = [layer.bounds[2].value, layer.bounds[1].value];

    var textColor = new SolidColor;
    textColor.rgb.red = 100;
    textColor.rgb.green = 100;
    textColor.rgb.blue = 100;



    var newTextLayer = addLayer(LAYERNAME + i, targetLayerSet);
    if (!newTextLayer) {
       alert('New SB Textlayer could not be created');
    }
    newTextLayer.kind = LayerKind.TEXT;
    strokeLayer();

    var fontInfo = fontName + ' ' + fontSize + ' '  + fontStyle + ' ' + fontWeight + ' ' +fontColor;
    if (contents) {
        RESULTTXT += 'font: ' + fontInfo + contents + " \r\n----------\r\n";
     }

    newTextLayer.textItem.contents = fontInfo
    newTextLayer.textItem.position = layerPosition;
    newTextLayer.textItem.size = 10;
    newTextLayer.textItem.color = textColor;

}


function layerExists(layerName) {
    try {
        activeDocument.artLayers.getByName(layerName);
        return true;
     } catch(e) {
        return false;
     }
}

function getLayerSet(layerSetName) {
    try {
        var layerSet = app.activeDocument.layerSets.getByName(layerSetName);
        return layerSet;
     } catch(e) {
        return false;
     }
}



// Some mysterious ps magic happens here
function strokeLayer() {
   ///app.activeDocument.activeLayer = app.activeDocument.artLayers.getByName(layerName);

   function cTID(s) { return app.charIDToTypeID(s); };
   function sTID(s) { return app.stringIDToTypeID(s); };

    var desc56 = new ActionDescriptor();
    var ref44 = new ActionReference();
    ref44.putProperty( cTID('Prpr'), cTID('Lefx') );
    ref44.putEnumerated( cTID('Lyr '), cTID('Ordn'), cTID('Trgt') );
    desc56.putReference( cTID('null'), ref44 );

    var desc57 = new ActionDescriptor();
    desc57.putUnitDouble( cTID('Scl '), cTID('#Prc'), 416.666667 ); //300dpi

    var desc58 = new ActionDescriptor();
    desc58.putBoolean( cTID('enab'), true );
    desc58.putEnumerated( cTID('Styl'), cTID('FStl'), cTID('OutF') );
    desc58.putEnumerated( cTID('PntT'), cTID('FrFl'), cTID('SClr') );
    desc58.putEnumerated( cTID('Md  '), cTID('BlnM'), sTID('normal') );
    desc58.putUnitDouble( cTID('Opct'), cTID('#Prc'), 30.000000 );
    desc58.putUnitDouble( cTID('Sz  '), cTID('#Pxl'), 1.000000 );

    var desc59 = new ActionDescriptor();
    desc59.putDouble( cTID('Rd  '), 255.000000 );
    desc59.putDouble( cTID('Grn '), 255.000000 );
    desc59.putDouble( cTID('Bl  '), 255.000000 );
    desc58.putObject( cTID('Clr '), cTID('RGBC'), desc59 );
    desc57.putObject( cTID('FrFX'), cTID('FrFX'), desc58 );
    desc56.putObject( cTID('T   '), cTID('Lefx'), desc57 );

    executeAction( cTID('setd'), desc56, DialogModes.NO );
 }


function setLayerSet(name) {
    var layerSet = getLayerSet(name);

    // delete if exists
    if (layerSet) {
       layerSet.remove();
    }

    layerSet = activeDocument.layerSets.add();
    layerSet.name = LAYERSETNAME;
    return layerSet;


}


function addLayer(name, targetLayerSet) {

    if (!targetLayerSet) {
      return null;
    }

    var newLayer = activeDocument.artLayers.add();
    newLayer.name = name;
    newLayer.move(targetLayerSet, ElementPlacement.INSIDE);


   return newLayer;
}


//strokeLayer(propLayerName);
var docRef = app.activeDocument;
recurseLayers(docRef);

var targetLayerSet = setLayerSet(LAYERSETNAME);

for(var i = 0; i <= TEXTLAYERS.length; i++) {

   createFontMetaLayer(TEXTLAYERS[i], i, targetLayerSet);
}

if (RESULTTXT) {
  prompt("Copy to clipboard: Ctrl+C, Enter", RESULTTXT);
}

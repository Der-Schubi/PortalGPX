// ==UserScript==
// @id             iitc-plugin-PortalGPX@DerSchubi
// @name           IITC plugin: PortalGPX
// @category       Info
// @version        0.0.0.1
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @description    Exports portals currently in view as a GPX.
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper() {
    // in case IITC is not available yet, define the base plugin object
    if (typeof window.plugin !== "function") {
        window.plugin = function() {};
    }
    // base context for plugin
    window.plugin.PortalGPX = function() {};
    var self = window.plugin.PortalGPX;
    // custom dialog wrapper with more flexibility
    self.gen = function gen() {
        var o = []; 
        var displayBounds = map.getBounds();
        //Create GPX Headers
        o.push("<?xml version=\"1.0\" ?>");
        o.push("  <gpx xmlns=\"http://www.topografix.com/GPX/1/1\"");
        o.push("       xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"");
        o.push("       xsi:schemaLocation=\"http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd\"");
        o.push("       version=\"1.1\"");
        o.push("       creator=\"GPS Data Team ( http://www.gps-data-team.com )\">");

        for (var x in window.portals) {
            var portal = window.portals[x];
            var coord = portal.getLatLng();
            // eliminate offscreen portals (selected, and in padding)
            if(displayBounds.contains(portal.getLatLng())) {
                // Generate wpt entries, format:
                // <wpt lon="12.123456" lat="34.123456"><name>Some Name</name></wpt>
                o.push("  <wpt lon=\"" + coord.lng + "\" lat=\"" + coord.lat + "\"><name>" + portal.options.data.title.replace(/\"/g, "\"\"") + "</name></wpt>");
            }
        }
        o.push("</gpx>");

        var dialog = window.dialog({
            title: "IITC: GPX export",
            // body must be wrapped in an outer tag (e.g. <div>content</div>)
            html: '<span>Save the GPX data below to a text file.</span>'
                + '<textarea id="PortalGPX" rows="30" style="width: 100%;"></textarea>'
        }).parent();
//        $(".ui-dialog-buttonpane", dialog).remove();
        dialog.css("width", "700px")
            .css("top", ($(window).height() - dialog.height()) / 2)
            .css("left", ($(window).width() - dialog.width()) / 2);
        $("#PortalGPX").val(o.join("\n"));

        return dialog;
    }
    // setup function called by IITC
    self.setup = function init() {
        // add controls to toolbox
        var link = $("<a onclick=\"window.plugin.PortalGPX.gen();\" title=\"Generate a GPX File from portals.\">GPX Export</a>");
        $("#toolbox").append(link);
        // delete setup to ensure init can't be run again
        delete self.setup;
    }
    // IITC plugin setup
    if (window.iitcLoaded && typeof self.setup === "function") {
        self.setup();
    } else if (window.bootPlugins) {
        window.bootPlugins.push(self.setup);
    } else {
        window.bootPlugins = [self.setup];
    }
}
// inject plugin into page
var script = document.createElement("script");
script.appendChild(document.createTextNode("(" + wrapper + ")();"));
(document.body || document.head || document.documentElement).appendChild(script);

//'Quick Render Selected layers'
// By HSOM - 2021
//
// Good for spitting out quick renders with an option to run a shell script at the end to convert to h264.

// UI Setup
{
    var win = new Window("window", undefined, undefined, {
        resizeable: true
    });
    win.text = "Quick Render Layers";
    win.orientation = "column";
    win.alignChildren = ["fill", "center"];
    win.spacing = 10;
    win.margins = 16;
    win.minWidth = 500;

    var rHeader = win.add("group", undefined, undefined, {
        name: "rHeader",
        orientation: "row",
    });
    rHeader.alignment = ["fill", "center"];
    rHeader.margins = [0, 0, 0, 20];

    var statictext1 = rHeader.add("statictext", undefined, undefined, {
        name: "statictext1",
        multiline: "true",
    });
    statictext1.enabled = false;
    statictext1.text = "Quick Render";

    var settingsBtn = rHeader.add("iconButton", undefined, undefined, {
        name: "settingsBtn",
    });

    settingsBtn.alignment = ["right", "center"];
    settingsBtn.text = "?";
    settingsBtn.size = [30, 30];

    // R0
    // ==
    var r0 = win.add("group", undefined, {
        name: "r0"
    });
    r0.orientation = "row";
    r0.alignChildren = ["fill", "fill"];
    r0.spacing = 10;
    r0.margins = 0;

    var statictext2 = r0.add("statictext", undefined, undefined, {
        name: "statictext2",
    });
    statictext2.text = "Output directory: ";

    var button1 = r0.add("button", undefined, undefined, {
        name: "button1"
    });
    button1.text = "Browse";

    // R1
    // ==
    var r1 = win.add("group", undefined, {
        name: "r1"
    });
    r1.orientation = "row";
    r1.alignChildren = ["fill", "fill"];
    r1.spacing = 10;
    r1.margins = 0;

    var statictext3 = r1.add("statictext", undefined, undefined, {
        name: "statictext3",
    });
    statictext3.text = "Output module: ";

    var dropdown1 = r1.add("dropdownlist", undefined, undefined, {
        name: "dropdown1",
    });
    dropdown1.selection = 0;
    dropdown1.preferredSize.width = 83;

    // R1
    // ==
    var r1 = win.add("group", undefined, {
        name: "r1"
    });
    r1.preferredSize.width = 100;
    r1.orientation = "row";
    r1.alignChildren = ["fill", "fill"];
    r1.spacing = 10;
    r1.margins = 5;

    var checkbox1 = r1.add("checkbox", undefined, undefined, {
        name: "checkbox1",
    });
    checkbox1.text = "Convert to h264";

    // R00
    // ==
    var r00 = win.add("group", undefined, {
        name: "r00"
    });
    r00.preferredSize.height = 0;
    r00.orientation = "column";
    r00.alignChildren = ["fill", "fill"];
    r00.spacing = 10;
    r00.margins = 5;
    r00.alignment = ["fill", "fill"];

    // R2
    // ==
    var r2 = win.add("group", undefined, {
        name: "r2"
    });
    r2.preferredSize.height = 20;
    r2.orientation = "column";
    r2.alignChildren = ["fill", "fill"];
    r2.spacing = 10;
    r2.margins = 5;
    r2.alignment = ["fill", "fill"];

    var Render = r2.add("button", undefined, undefined, {
        name: "Render"
    });
    Render.text = "Render";
    Render.alignment = ["fill", "bottom"];
    Render.enabled = false;
    Render.preferredSize.height = 50;

    win.show();

    refreshTemplates();

    win.maxWidth = 100;

    win.layout.layout(true);
    win.layout.resize();
    win.onResizing = win.onResize = function() {
        this.layout.resize();
    };

    win.show();

    // Button functionality

    Render.onClick = function() {
        QR();
    };

    button1.onClick = function() {
        var defaultFolder = "something";
        if ($.os.indexOf("Windows") !== -1)
            // On Windows, escape backslashes first
            defaultFolder = defaultFolder.replace("\\", "\\\\");

        var folder = Folder.selectDialog("Output To Folder", defaultFolder);
        var outFolder = folder.fsName;
        Render.enabled = true;
        button1.active = false;

        if (r00.children.length > 0) r00.remove(0);

        var fString = r00.add("statictext", undefined, undefined, {
            name: "fString",
        });

        fString.enabled = false;
        fString.text = outFolder + "/" + "[myLayer]";
        MY_FILE = outFolder.toString();
        alert(MY_FILE);
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function() {
            this.layout.resize();
        };
    };

    settingsBtn.onClick = function() {
        alert("runffmpeg");
        ffmpeg();

        var setsWin = new Window("dialog", undefined, undefined);
        setsWin.text = "Settings";
        setsWin.orientation = "column";
        setsWin.alignChildren = ["fill", "center"];
        setsWin.spacing = 10;
        setsWin.margins = 16;

        setsWin.minWidth = 500;


        var setsGrp1 = setsWin.add("group", undefined, {
            name: "setsGrp1",
        });


        var setsStaticText1 = setsGrp1.add("statictext", {
            name: "setsStaticText1",
        });

        setsStaticText1.text = "Hello";



        setsWin.show();
    };
}

// Variables
var myComp = app.project.activeItem;
var ffmpegInstallation = "\"/Users/hsom/Library/Application Support/Adobe/CEP/extensions/Anubis/src/ffmpeg/ffmpeg\"";

function QR() {
    if (myComp && myComp instanceof CompItem) {

        if (myComp.selectedLayers < 1) {
            return alert("Error \n  Select at least one layer to render");
        };

        //Loop through each selected layer
        for (var i = 0; i < myComp.selectedLayers.length; i++) {
            myLayer = myComp.selectedLayers[i];

            // Store variables for cur work area to reset later
            var a = myComp.workAreaStart;
            var b = myComp.workAreaStart;

            // Reset work area bounds to get around the annoying problem
            myComp.workAreaStart = 0;
            myComp.workAreaDuration = myComp.duration;

            // Set new work area bounds
            myComp.workAreaStart = myLayer.inPoint;
            myComp.workAreaDuration = myLayer.outPoint - myLayer.inPoint;

            // Check if selected, get attributes for render queue

            var rqi = app.project.renderQueue.items.add(myComp);

            // sets the render duration manually
            rqi.applyTemplate("Best Settings");
            rqi.timeSpanStart = myComp.workAreaStart;
            rqi.timeSpanDuration = myComp.workAreaDuration;
            var om = rqi.outputModule(1);
            om.applyTemplate(dropdown1.selection);
            var outFName = myLayer.name;

            // If h264 checked, stores in temp subfolder 
            if(checkbox1.value == 1){
            alert(system.callSystem("mkdir -p \"" + MY_FILE + "/mp4\""));
            om.file = new File(MY_FILE + "/mp4/" + outFName);
            }else{
            om.file = new File(MY_FILE + "/" + outFName);
        };

        };
        // Reset work area duration
        myComp.workArea = a;
        myComp.workAreaDuration = b;

        // Render queue
        app.project.renderQueue.render();

        //Render out h264 versions if checkbox ticked
        ffmpeg();
    };
};

function refreshTemplates() {
    var activeComp = app.project.activeItem;

    dropdown1.selection = null;
    dropdown1.removeAll();

    // Get the list of render settings and output module templates
    // (Need to add a dummy comp to the render queue to do this)
    var rqi = app.project.renderQueue.items.add(activeComp);
    var om = rqi.outputModule(1); // Assumes at least one output module
    activeComp.openInViewer();

    for (var i = 0; i < om.templates.length; i++)
        if (om.templates[i].indexOf("_HIDDEN") !== 0)
            // Don't add hidden templates, like for X-Factor
            dropdown1.add("item", om.templates[i]);

    if (om.templates.length > 0) dropdown1.selection = 0;

    rqi.remove(); // Remove the temp render queue item
};

function ffmpeg() {

    var syscall = ("cd \"" + MY_FILE + "/mp4\"; for i in *.mov; do " + ffmpegInstallation + " -y -i \"\$i\" \"\$\{i\%.*\}.mp4\"; done &").toString();
    if (checkbox1.value == 1) {
        alert(syscall);
        var myCall = system.callSystem(syscall);
        alert(myCall);
    } else {
        return
    };
};
// quick-render.jsx by j.b.

// -----------------------------------------------
//                   Variables                    
// -----------------------------------------------

var myComp = app.project.activeItem;
var ffmpegInstallation = "\"/Users/hsom/Library/Application Support/Adobe/CEP/extensions/Anubis/src/ffmpeg/ffmpeg\"";


// -----------------------------------------------
//                Set up UI Panel                 
// -----------------------------------------------

{
    var win = new Window("window", undefined, undefined, {
        resizeable: true
    });

    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 0;
    win.margins = 0;
    win.minWidth = 500;

    var renderButtonGrp = win.add("group", undefined, undefined, {
        name: "renderButtonGrp"
    });
    renderButtonGrp.alignment = ["fill", "top"];

    var tp = win.add("tabbedpanel", undefined, undefined, {
        name: "tp",
        borderStyle: "black"
    });
    tp.alignChildren = ["fill", "fill"];
    tp.margins = [0, 0, -100, 0];
    tp.alignment = ["fill", "fill"];
    tp.borderStyle = ["black"];
    tp.scrolling = true;


    var tab1 = tp.add("tab", undefined, undefined, {
        name: "tab1"
    });
    tab1.text = "R";
    tab1.orientation = "column";
    tab1.alignChildren = ["fill", "fill"];
    tab1.alignment = ["fill", "fill"];
    tab1.spacing = 0;
    tab1.margins = [10, 10, 10, 0];

    var tab2 = tp.add("tab", undefined, undefined, {
        name: "tab2"
    });
    tab2.text = "M";
    tab2.orientation = "column";
    tab2.alignChildren = ["fill", "top"];
    tab2.margins = 10;
    tab2.minWidth = 500;

    var tab3 = tp.add("tab", undefined, undefined, {
        name: "tab3"
    });
    tab3.text = "O";
    tab3.orientation = "column";
    tab3.alignChildren = ["fill", "top"];
    tab3.margins = 10;
    tab3.minWidth = 500;

    // R0
    // ==
    var r0 = tab3.add("group", undefined, {
        name: "r0"
    });
    r0.orientation = "row";
    r0.spacing = 0;
    // r0.alignChildren = ["fill", "fill"];


    var statictext2 = r0.add("statictext", undefined, undefined, {
        name: "statictext2",
    });
    statictext2.text = "Output: ";

    var button1 = r0.add("iconbutton", undefined, undefined, {
        name: "button1",
        style: "normal"
    });
    button1.text = "Browse";

    // ------------------ Row 01 ---------------------

    var r1 = tab2.add("group", undefined, {
        name: "r1"
    });
    r1.orientation = "row";
    r1.alignChildren = ["fill", "top"];
    r1.spacing = 0;
    r1.margins = 0;
    r1.scrolling = true;

    var statictext3 = r1.add("statictext", undefined, undefined, {
        name: "statictext3",
    });
    statictext3.text = "Module: ";

    var dropdown1 = r1.add("dropdownlist", undefined, undefined, {
        name: "dropdown1",
    });
    dropdown1.selection = 0;
    dropdown1.preferredSize.width = 83;

    var checkbox1 = r1.add("checkbox", undefined, undefined, {
        name: "checkbox1",
    });
    checkbox1.text = "Create h264";
    checkbox1.value = true;

    r1.alignChildren = ["fill", "top"];

    // R00
    // ==
    var r00 = win.add("group", undefined, {
        name: "r00"
    });
    r00.preferredSize.height = 0;
    r00.orientation = "column";
    r00.alignChildren = ["center", "bottom"];
    r00.spacing = 10;
    r00.margins = 50;
    r00.alignment = ["left", "bottom"];

    var Render = tab1.add("iconbutton", undefined, undefined, {
        name: "Render",
        style: "normal"
    });
    Render.text = "Render";
    Render.alignment = ["fill", "fill"];
    Render.enabled = false;

    win.show(); // Reset UI
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

        Render.addEventListener("mouseover", function() {
            Render.text = "Render to: " + outFolder;
            Render.active = false;
        })

        Render.addEventListener("mouseout", function() {
            Render.text = "Render";
        })

        if (r00.children.length > 0) r00.remove(0);

        var fString = tab3.add("statictext", undefined, undefined, {
            name: "fString",
        });

        fString.enabled = false;
        fString.text = "Export to:" + outFolder + "/" + "[myLayer]";
        MY_FILE = outFolder.toString();
        alert(MY_FILE);
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function() {
            this.layout.resize();
        };

    };
}

// Check to see if files can be written by the network
canWriteFiles();

updateSetting(checkbox1.value, true);

// -----------------------------------------------
//                   Functions                    
// -----------------------------------------------

// When UI panel is updated, store the settings 
function updateSetting(settingName, settingValue) {
    var sectionName = "qrl"
    var sets = app.settings;

    if (!(sets.haveSetting(sectionName, settingName))) {
        // alert("This would establish a setting");

        // Then save the setting

        sets.saveSetting(sectionName, settingName, settingValue);

    } else {
        // alert("This would update the setting");
        alert(sets.getSetting(sectionName, settingName));
        sets.saveSetting(sectionName, settingName, settingValue);
    }
};

// Checks whether script has permission to write files to the network
function canWriteFiles() {
    var commandID, scriptName, tabName;

    commandID = 3131;
    tabName = 'Scripting & Expressions';

    if (isSecurityPrefSet()) return true;


    alert(message = 'This script requires access to write files.\n' +
        'Go to the "' + tabName + '" panel of the application preferences and make sure ' +
        '"Allow Scripts to Write Files and Access Network" is checked.');

    app.executeCommand(commandID);

    return isSecurityPrefSet();

    function isSecurityPrefSet() {
        return app.preferences.getPrefAsLong(
            'Main Pref Section',
            'Pref_SCRIPTING_FILE_NETWORK_SECURITY'
        ) === 1;
    }
}

// Grabs all templates from the list of output modules
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

function QR() {
    if (myComp && myComp instanceof CompItem) {

        if (myComp.selectedLayers < 1) {
            return alert("Error \n  Select at least one layer to render");
        };

        for (var i = 0; i < myComp.selectedLayers.length; i++) { //Loop through each selected layer
            myLayer = myComp.selectedLayers[i];

            var a = myComp.workAreaStart; // Store variables for cur work area to reset later
            var b = myComp.workAreaDuration;

            myComp.workAreaStart = 0; // Reset work area bounds to get around the annoying problem
            myComp.workAreaDuration = myComp.duration;

            myComp.workAreaStart = myLayer.inPoint; // Set new work area bounds
            myComp.workAreaDuration = myLayer.outPoint - myLayer.inPoint;

            var rqi = app.project.renderQueue.items.add(myComp); // Check if selected, get attributes for render queue

            // sets the render duration manually
            rqi.applyTemplate("Best Settings");
            rqi.timeSpanStart = myComp.workAreaStart;
            rqi.timeSpanDuration = myComp.workAreaDuration;
            var om = rqi.outputModule(1);
            om.applyTemplate(dropdown1.selection);
            var outFName = myLayer.name;

            // If h264 checked, stores output in temp subfolder 
            if (checkbox1.value == 1) {
                alert(system.callSystem("mkdir -p \"" + MY_FILE + "/Generating MP4s...\""));
                om.file = new File(MY_FILE + "/Generating MP4s.../" + outFName);
            } else {
                om.file = new File(MY_FILE + "/" + outFName);
            };

        };
        // Reset work area duration
        myComp.workArea = a;
        myComp.workAreaDuration = b;

        var animationInterval = 250;
        animate(animationInterval);

        // Render queue - doesn't return until render finished
        app.project.renderQueue.render();

        //Render out h264 versions if checkbox ticked

        var syscall1 = ("cd \"" + MY_FILE + "/Generating MP4s...\"; for i in *.mov; do " + ffmpegInstallation + " -y -i \"\$i\" \"\$\{i\%.*\}.mp4\"; mv *.mp4 .. ; done").toString();
        var syscall2 = ("cd \"" + MY_FILE + "\"; rm -r \"./Generating MP4s...\"");
        if (checkbox1.value == true) {
            // Change button text
            Render.text = "Generating MP4s...";
            Render.active = false;
            Render.enabled = false;
            win.layout.layout(true);

            alert(syscall1);
            var myCall = system.callSystem(syscall1);
            var myCall = system.callSystem(syscall2);
            alert(myCall);
        } else {
            return
        };

        Render.text = "Done!";
        Render.active = false;
        $.sleep(250);

        // Change button text back
        Render.text = "Render";
        Render.active = false;
        Render.enabled = true;
        win.layout.layout(true);

    };
};



function animate(interval) {
    // Change button text
    Render.text = "Let's goooo";
    Render.active = false;
    Render.enabled = false;
    win.layout.layout(true);
    $.sleep(interval);
    Render.text = "😎";
    Render.active = false;
    Render.enabled = false;
    win.layout.layout(true);
    $.sleep(interval);
    Render.text = "!!";
    Render.active = false;
    Render.enabled = false;
    win.layout.layout(true);
    $.sleep(interval);
    Render.text = "!!!";
    Render.active = false;
    Render.enabled = false;
    win.layout.layout(true);
    $.sleep(interval);
    Render.text = "RENdering";
    Render.active = false;
    Render.enabled = false;
    win.layout.layout(true);
    $.sleep(interval);
    Render.text = "RENDERing";
    Render.active = false;
    Render.enabled = false;
    win.layout.layout(true);
    $.sleep(interval);
    Render.text = "RENDERING";
    Render.active = false;
    Render.enabled = false;
    win.layout.layout(true);
    $.sleep(interval);
    Render.text = "RENDERING";
    Render.active = false;
    Render.enabled = false;
    win.layout.layout(true);
};
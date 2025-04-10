// =======================================================================
// Script Name: ProjectOrganizer
// Description: Automatically organizes project items into folders by type
// Author: Aleksandr Zakharov (https://github.com/jakkimcfly)
// License: MIT
// =======================================================================

(function projectOrganizerScript() {
    
    var SCRIPT_NAME = "ProjectOrganizer";
    var SCRIPT_VERSION = "1.0.0";
    var PREF_SECTION = "ProjectOrganizerSettings";

    var DEFAULT_VALUES = [
        { folder: "Videos", defaultExtensions: "mp4,mov,avi,mkv" },
        { folder: "Images", defaultExtensions: "jpg,jpeg,png,gif,tif,bmp" },
        { folder: "Audio", defaultExtensions: "mp3,wav,aiff,aac" },
        { folder: "Comp" },
        { folder: "Solid" },
        { folder: "Other" }
    ];
    var PANEL_INDEXES = {
        Videos: 0,
        Images: 1,
        Audio: 2,
        Comp: 3,
        Solid: 4,
        Other: 5
    };

    var PANELS = [];

    /**
     * Saves a setting value to the preferences.
     * @param {string} key - The key name for the setting.
     * @param {any} value - The value to be stored.
     */
    function saveSetting(key, value) {
        app.settings.saveSetting(PREF_SECTION, key, value);
    }

    /**
     * Loads a setting value from the preferences.
     * @param {string} key - The key name for the setting.
     * @param {any} defaultValue - The value to return if no setting is found.
     * @returns {any} - The stored value or the default value.
     */
    function loadSetting(key, defaultValue) {
        if (app.settings.haveSetting(PREF_SECTION, key) && app.settings.getSetting(PREF_SECTION, key) !== "null") {
            return app.settings.getSetting(PREF_SECTION, key);
        }
        return defaultValue;
    }

    /**
     * Clears a setting by setting its value to null.
     * @param {string} key - The key name of the setting to clear.
     */
    function clearSetting(key) {
        app.settings.saveSetting(PREF_SECTION, key, null);
    }

    /**
     * Checks if a file has one of the provided extensions.
     * @param {File} file - The file to check.
     * @param {string} extensions - A comma-separated list of valid extensions.
     * @returns {boolean} - True if file has one of the extensions.
     */
    function hasExtension(file, extensions) {
        var fileName = file.name.toLowerCase();
        var extensionsArray = extensions.toLowerCase().split(",");
        for (var i = 0; i < extensionsArray.length; i++) {
            var extension = extensionsArray[i].toLowerCase();
            if (fileName.lastIndexOf(extension) === fileName.length - extension.length) {
                return true;
            }
        }
        return false;
    }

    /**
     * Creates a panel in the UI for a media type (e.g., videos, images).
     * @param {Panel|Window} win - The parent UI element.
     * @param {string} name - The internal name of the panel.
     * @param {string} title - The visible title of the panel.
     * @param {number} index - Index corresponding to DEFAULT_VALUES.
     * @param {boolean} [hasExtensions] - Whether this panel should include an extensions input field.
     * @returns {Object} - UI components for this panel.
     */
    function createPanel(win, name, title, index, hasExtensions) {
        if (hasExtensions === undefined) hasExtensions = true;

        var panel = win.add("panel", undefined, title);
        panel.orientation = "row";
        panel.alignChildren = "center";

        var checkbox = panel.add("checkbox", undefined, "");
        checkbox.value = loadSetting(name + "_Value", "true") === "true";

        var folderInput = panel.add("edittext", [0, 0, 150, 20], loadSetting(name + "_Folder", DEFAULT_VALUES[index].folder));
        var extensionsInput = null;
        if (hasExtensions) {
            panel.add("statictext", undefined, "Extensions:");
            extensionsInput = panel.add("edittext", [0, 0, 150, 20], loadSetting(name + "_Extensions", DEFAULT_VALUES[index].defaultExtensions));
        }

        return { name: name, checkbox: checkbox, folderInput: folderInput, extensionsInput: extensionsInput };
    }

    /**
     * Builds the full user interface for the script.
     * @param {any} thisObj - Context in which the UI is created.
     * @returns {Panel|Window} - The created UI panel or window.
     */
    function createUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", SCRIPT_NAME + " " + SCRIPT_VERSION, undefined);
        win.orientation = "column";
        win.alignChildren = "center";

        // Header
        var headerGroup = win.add("group");
        headerGroup.orientation = "column";
        headerGroup.alignment = "center";
        headerGroup.add("statictext", undefined, SCRIPT_NAME + " " + SCRIPT_VERSION);
        headerGroup.add("statictext", undefined, "Automatically organize items into folders by type");

        // Divider
        var divider = win.add("panel", undefined, undefined, { borderStyle: "sunken" });
        divider.alignment = "fill";

        // Media panels
        PANELS = [
            createPanel(win, "Videos", "Videos Folder", PANEL_INDEXES.Videos),
            createPanel(win, "Images", "Images Folder", PANEL_INDEXES.Images),
            createPanel(win, "Audio", "Audio Folder", PANEL_INDEXES.Audio),
            createPanel(win, "Comp", "Compositions", PANEL_INDEXES.Comp, false),
            createPanel(win, "Solid", "Solids Folder", PANEL_INDEXES.Solid, false),
            createPanel(win, "Other", "Other Folder", PANEL_INDEXES.Other, false)
        ];

        // Exclusion settings
        var exclusionPanel = win.add("panel", undefined, "Exclude files containing:");
        exclusionPanel.orientation = "column";
        var radioGroup = exclusionPanel.add("group");
        radioGroup.orientation = "row";
        var filterByName = radioGroup.add("radiobutton", undefined, "Exclude by name");
        var filterByComment = radioGroup.add("radiobutton", undefined, "Exclude by comment");
        switch (loadSetting("ExclusionPanel_Value", "name")) {
            case "comment":
                filterByComment.value = true
                break;
            default:
                filterByName.value = true;
        }
        var exclusionInput = exclusionPanel.add("edittext", undefined, loadSetting("ExclusionPanel_Text", ""));
        exclusionInput.characters = 20;

        // Buttons
        var btnsGroup = win.add("group");
        btnsGroup.orientation = "row";
        var btnSubmit = btnsGroup.add("button", undefined, "Submit");
        var btnReset = btnsGroup.add("button", undefined, "Reset Values");

        // Divider
        var divider = win.add("panel", undefined, undefined, { borderStyle: "sunken" });
        divider.alignment = "fill";

        // Footer
        var footerGroup = win.add("group");
        footerGroup.orientation = "column";
        footerGroup.alignment = "center";
        footerGroup.add("statictext", undefined, "Author: Aleksandr Zakharov");
        footerGroup.add("statictext", undefined, "GitHub: github.com/jakkimcfly");
        footerGroup.add("statictext", undefined, "License: MIT");

        /**
         * Event handler for the Submit button.
         * Organizes project items into folders based on user-defined settings.
         */
        btnSubmit.onClick = function () {
            app.beginUndoGroup("Organize Project Items");

            var folders = {};
            var projectItems = [];
            var exclusionText = exclusionInput.text.toLowerCase();

            // Create folders if enabled
            for (var i = 0; i < PANELS.length; i++) {
                if (PANELS[i].checkbox.value && PANELS[i].folderInput.text) {
                    folders[DEFAULT_VALUES[i].folder] = app.project.items.addFolder(PANELS[i].folderInput.text);
                }
                saveSetting(PANELS[i].name + "_Folder", PANELS[i].folderInput.text);
                if (PANELS[i].extensionsInput) saveSetting(PANELS[i].name + "_Extensions", PANELS[i].extensionsInput.text);
                saveSetting(PANELS[i].name + "_Value", PANELS[i].checkbox.value);
            }

            saveSetting("ExclusionPanel_Text", exclusionInput.text);
            saveSetting("ExclusionPanel_Value", filterByName.value ? "name" : "comment");

            // Filter items based on exclusion rules
            for (var i = 1; i <= app.project.numItems; i++) {
                var item = app.project.item(i);
                var itemName = item.name.toLowerCase();
                var itemComment = item.comment ? item.comment.toLowerCase() : "";

                var exclude = false;
                if (filterByName.value && exclusionText) {
                    exclude = itemName.indexOf(exclusionText) !== -1;
                } else if (filterByComment.value && exclusionText) {
                    exclude = itemComment.indexOf(exclusionText) !== -1;
                }
                if (!exclude) {
                    projectItems.push(item);
                }
            }

            // Move items to corresponding folders
            for (var i = 0; i < projectItems.length; i++) {
                var item = projectItems[i];
                if (item instanceof FolderItem) continue;
                var moved = false;

                if (PANELS[PANEL_INDEXES.Comp].checkbox.value && item instanceof CompItem) {
                    item.parentFolder = folders[DEFAULT_VALUES[PANEL_INDEXES.Comp].folder];
                    moved = true;
                }

                if (item instanceof FootageItem) {
                    if (PANELS[PANEL_INDEXES.Solid].checkbox.value && item.mainSource instanceof SolidSource) {
                        item.parentFolder = folders[DEFAULT_VALUES[PANEL_INDEXES.Solid].folder];
                        moved = true;
                    } else if (item.file) {

                        if (PANELS[PANEL_INDEXES.Videos].checkbox.value && hasExtension(item.file, PANELS[PANEL_INDEXES.Videos].extensionsInput.text)) {
                            item.parentFolder = folders[DEFAULT_VALUES[PANEL_INDEXES.Videos].folder];
                            moved = true;
                        }

                        if (PANELS[PANEL_INDEXES.Images].checkbox.value && hasExtension(item.file, PANELS[PANEL_INDEXES.Images].extensionsInput.text)) {
                            item.parentFolder = folders[DEFAULT_VALUES[PANEL_INDEXES.Images].folder];
                            moved = true;
                        }

                        if (PANELS[PANEL_INDEXES.Audio].checkbox.value && hasExtension(item.file, PANELS[PANEL_INDEXES.Audio].extensionsInput.text)) {
                            item.parentFolder = folders[DEFAULT_VALUES[PANEL_INDEXES.Audio].folder];
                            moved = true;
                        }
                    }
                }

                if (!moved && PANELS[PANEL_INDEXES.Other].checkbox.value) {
                    item.parentFolder = folders[DEFAULT_VALUES[PANEL_INDEXES.Other].folder];
                }
            }

            app.endUndoGroup();
        };

        /**
         * Event handler for the Reset button.
         * Restores default values and clears saved settings.
         */
        btnReset.onClick = function () {
            for (var i = 0; i < PANELS.length; i++) {
                PANELS[i].checkbox.value = true;
                PANELS[i].folderInput.text = DEFAULT_VALUES[i].folder;
                if (PANELS[i].extensionsInput) PANELS[i].extensionsInput.text = DEFAULT_VALUES[i].defaultExtensions;

                clearSetting(PANELS[i].name + "_Folder");
                clearSetting(PANELS[i].name + "_Extensions");
                clearSetting(PANELS[i].name + "_Value");
            }

            exclusionInput.text = "";
            filterByName.value = true;
            clearSetting("ExclusionPanel_Text");
            clearSetting("ExclusionPanel_Value");
        }
        win.layout.layout(true);
        return win;
    }

    // Initialize and show UI
    var ui = createUI(this);
    if (ui instanceof Window) {
        ui.center();
        ui.show();
    }
})();
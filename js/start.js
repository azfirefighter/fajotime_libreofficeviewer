(function(OCA) {
    OCA.Fajotime = OCA.Fajotime || {};

    OCA.Fajotime.LibreOfficeViewerPlugin = {
        attach: function(fileListView) {
            // Call when a file of our type is selected.
            //
            function actionHandler(fileName, context) {
                var downloadUrl = context.fileList.getDownloadUrl(fileName, context.dir);
                if (downloadUrl && downloadUrl !== '#') self.show(downloadUrl, true);
            }

            // Register a mimetype. Will call actionHandler once selected.
            //
            function registerMimeType(mimeType) {
                fileActions.registerAction({
                    name: 'view',
                    displayName: 'Favorite',
                    mime: mimeType,
                    permissions: OC.PERMISSION_READ,
                    actionHandler: actionHandler
                });

                fileActions.setDefault(mimeType, 'view');
            }

            let self = this,
                fileActions = fileListView.fileActions;

            registerMimeType('application/vnd.oasis.opendocument.text');
            registerMimeType('application/vnd.oasis.opendocument.presentation');
            registerMimeType('application/vnd.oasis.opendocument.spreadsheet');
        },

        hide: function() {
            $('#odtviewer').remove();

            // Say we are not showing a viewer anymore.
            if (typeof FileList !== 'undefined') FileList.setViewerMode(false);

        },

        show: function(downloadUrl, isFileList) {
            let self = this,
                shown = true,
                viewer = OC.getRootPath() + '/apps/fajotime_libreofficeviewer/vendor/viewerjs/index.html#' + downloadUrl,
                $iframe = $('<iframe id="odtviewer" style="width:100%;height:100%;display:block;position:absolute;top:0;z-index:1041;left:0;" src="'+viewer+'" sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-top-navigation" allowfullscreen="true"/>');

            // In the file list or in the preview ?
            // Say we are showing a viewer.
            //
            if (isFileList === true) FileList.setViewerMode(true);

            // Add the iframe.
            $('#app-content').after($iframe);

            // Will be call once the iframe load.
            //
            $('#odtviewer').load(function(){
                var $iframe = $($('#odtviewer').contents());

                // Hide the download button.
                $iframe.find('#download').css('display', 'none');

                // Hide view if click escape.
                $(document).keyup(function(e) { if (shown && e.keyCode == 27) { shown = false; self.hide(); } });
                $iframe.keyup(function(e) { if (shown && e.keyCode == 27) { shown = false; self.hide(); } });
            });

            // Allow to hide when click on back on the navigator button.
            //
            history.pushState({}, '', '#odtviewer');
            $(window).one('popstate', function (e) { self.hide(); });
        }
    };

})(OCA);

// Register the file list plugin. Will call hist attach method once ready.
OC.Plugins.register('OCA.Files.FileList', OCA.Fajotime.LibreOfficeViewerPlugin);

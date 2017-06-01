angular.
module('bulkUpload', ['ngRoute'])
    .directive('ngFiles', ['$parse', function ($parse) {
        function fn_link(scope, element, attrs) {
            var onChange = $parse(attrs.ngFiles);
            element.on('change', function (event) {
                onChange(scope, {
                    $file: event.target.files
                });
            });
        };
        return {
            link: fn_link
        }
    }]).

component('bulkUpload', {
    templateUrl: 'bulk-upload/bulk-upload.template.html',
    controller: function BulkUploadController($http, $scope, $window, $parse) {
        $("title").html("Bulk Upload");
        $("#example-entries").html('<center><p>Please select a category to see examples.</p></center>');
        $("#expand-examples").css("width", "25%");
        $("#uploadBtn").attr("disabled", true);
        var somethingSelected = false;
        var instr_modules = 'as a part of the Modules in the following order: "Module Code", </br> "Module Name",  "Description", "Level", "Credits", "Day of Lecture", </br> "Lecture time (HH:MM:SS)",  "Coursework Percentage", "Faculty".';
        var instr_tags = 'as a pair of "TagName","Category" on each row. <p/><span id="hint">Click the question mark below to see an example of what the file should contain.';
        var instr_mod_tags = 'as a pair of "Module ID", "Tag Name" on each row.';
        var instr_degrees = 'as a pair of attributes: "Course title", "Length of study".';
        var instr_deg_mod = 'with the following attributes: "DegreeID", "ModuleID", "IsOptional"(dom: {true,false})';
        var instr_dep = 'with the following attributes: "DegreeID", "Dependency", "Parent".';
        var instr_rec = 'with the following attributes: "DegreeID", "ModuleID", "Recommendation"';
        var example_modules = 'Module Code,Module Name,Description,Level,Credits,Day,Time,Faculty <br/> 4CCS1ELA,Elementary Logic with Applications,"Description1",4,15,,,Faculty of Natural & Mathematical Sciences <br/>5BYN2001,Molecular and Cellular Neuroscience,"Description2",5,15,Thursday,15:00:00,Faculty of Life Sciences & Medicine  <br/>6SSW3004,War and International Politics in Africa,"Description3",6,15,Wednesday,,Faculty of Social Science & Public Policy <br/>7KNIM752,District Nursing Skills,"Description4",7,30,Tuesday,14:00:00,Florence Nightingale Faculty of Nursing & Midwifery <br/>7AAEM520,Conflict: 20th-century War Literature,"Description5",7,30,Friday,16:00:00,Faculty of Arts & Humanities ';
        var example_tags = 'Tag Name,Tag Category<br/>Coursework-based,Assessment<br/>Problem-solving,Skills<br/>Team-work,Skills<br/>Astrology,Careers<br/>BSc,<br/>Logic,Skills';
        var example_mod_tags = 'Module Code,Tag Name <br/>5CCS2OSC,Operating-Systems<br/>7AAVDC06,Media<br/>4AAYCL21,Modern-Poetry<br/>4AACAL01,Classics<br/>4CCC0060,Chemistry<br/>6CCM332A,Quantum-Theory';
        var example_degrees = 'Degree ID,Years <br/>BSc Computer Science,3<br/>BSc Computer Science with a Year Abroad,4<br/>BEng Biomedical Engineering,<br/>MSc Clinical Nursing,1 <br/>BSc Economics,3<br/>DClinPsy,Doctorate in Clinical Psychology,3';
        var example_deg_mod = 'DegreeID,ModuleID,IsOptional <br/> BSc Computer Science,4CCS1FC1,false <br/> BA Arts and Humanities,4ABA0004,true <br/> BA History,4AAH1001,false <br/>MSc Nursing,7KNIM752,false'
        var example_dep = 'DegreeID,Dependency,Parent <br/> BSc Computer Science,4CCS1FC1,5CCS2FC2 <br/> BA Arts and Humanities,4ABA0004,4ABA0006 <br/>BA History,4AAH1001,4AAH1003 <br/>MSc Nursing,7KNIM752,7KNIM776 <br/>PhD Law,7FFLA009,7FFLA010';
        var example_rec = 'DegreeID,ModuleID,Recommendation <br/>BSc,5CCS2PEP,5CCS2OSC <br/>BA English Language and Literature,4AAEA001,4AAEA005 <br/>BA Film Studies, 4AAQH121, 4AAQH126 <br/>BSc Biochemistry,6BBB0320,6BBB0321 <br/>MSc Mathematics,7CCMNE08,7CCMNE09';
        var warning_modules = '<i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> Note that you still have to insert all commas even if you would like to leave an attribute value blank. <br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> Module Codes cannot be omitted. The rest of the attributes are optional.<br/><i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> The first row is not inserted into the database. All columns count.';
        var warning_tags = '<i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> A tag can be associated with only one category.<br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> Tag names cannot be omitted. <br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i>Tag category is optional but if omitted, the comma still has to be inserted.<br/><i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> The first row is not inserted into the database. All columns count. ';
        var warning_mod_tag = '<i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> All attributes need to be provided. <br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> Make sure that a Module entity with the given ID already exists in the database. <br/><i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i>The tag name has to also correspond to a tag that can be found in the database. <br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> The first row is not inserted into the database. All columns count.';
        var warning_degrees = '<i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> Course titles have to be provided. <br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> Length of study is optional but if omitted, the comma still has to be inserted.<br/><i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> The first row is not inserted into the database. All columns count.';
        var warning_deg_mod = '<i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> All the attributes need to be provided. <br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> Make sure the two entities have been referenced in the database.<br/><i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> The first row is not inserted into the database. All columns count.';
        var warning_module_dep = '<i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> All the attributes need to be provided. <br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> The first row is not inserted into the database. All columns count. <br/> <i class="glyphicon glyphicon-warning-sign" style="font-size:1.2em;padding-right:5px;color:red"></i> Make sure all 3 entities have been referenced in the database.';

        /** 
         *instruction-option shown by default 
         */
        $scope.default_option = "Select Type Of Data";

        /** 
         *options for select element
         */
        $scope.dataOptions = [{
            name: $scope.default_option
        }, {
            name: "Modules"
        }, {
            name: "Tags"
        }, {
            name: "Module-Tag Assignments"
        }, {
            name: "Degrees"
        }, {
            name: "Degree-Module Assignment"
        }, {
            name: "Module Dependencies"
        }, {
            name: "Module Recommendations"
        }];

        /**
         *Leaves only file name and extension from the file path
         */
        $(document).on('change', ':file', function () {
            var input = $(this),
                numFiles = input.get(0).files ? input.get(0).files.length : 1,
                label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
            input.trigger('fileselect', [numFiles, label]);
        });

        /**
         *Changes the text from "No File Selected"/some file name to  new file name
         */
        $(document).ready(function () {
            $(':file').on('fileselect', function (event, numFiles, label) {
                var input = $(this).parents('.input-group').find(':text'),
                    fileName = numFiles > 1 ? numFiles + ' files selected' : label;
                if (input.length) {
                    input.val(fileName);
                } else {
                    if (fileName) {
                        $("#fileName").text(fileName);

                    }
                }

            });
        });

        /** 
         *Toggles between examples shown and examples hidden by changing the display properties of the #hint element from hidden to block and vice versa
         */
        $scope.showExample = function () {
            var view = $("#example-upload");
            var icon = $("#example-icon");
            var hint = $("#hint");
            if (view.css("display") == "none") {
                view.css("display", "block");
                hint.css("display", "none");
                icon.attr("class", "glyphicon glyphicon-remove");
            } else {
                view.css("display", "none");
                hint.css("display", "inline");
                icon.attr("class", "glyphicon glyphicon-question-sign");
            }
        }

        var formdata = new FormData();

        /** 
         *Appends the $file to the formdata object at index 0
         *@param {string} $file - The file which you wish to append.
         */
        $scope.getFile = function ($file) {
            formdata.append("batch", $file[0]);
        };

        /** 
         *API call needed
         */
        $scope.method = "";

        /** 
         *Change instructions, examples, warnings and value of API post method needed in accordance with the selected data type
         */
        $("#select_data").change(function () {
            $("#uploadBtn").attr("disabled", false);
            var selected = $("#select_data option:selected").text();
            somethingSelected = true;
            if (selected.includes("Modules")) {
                $("#example-entries").html(example_modules);
                $("#warning_p").html(warning_modules);
                $("#init_instructions").html(instr_modules);
                $("#expand-examples").css("width", "50%");
                $scope.method = "/api/modules";
            } else if (selected.includes("Tags")) {
                $("#example-entries").html(example_tags);
                $("#warning_p").html(warning_tags);
                $("#expand-examples").css("width", "33%");
                $("#init_instructions").html(instr_tags);
                $scope.method = "/api/tags";
            } else if (selected.includes("Module-Tag")) {
                $("#example-entries").html(example_mod_tags);
                $("#warning_p").html(warning_mod_tag);
                $("#expand-examples").css("width", "35%");
                $("#init_instructions").html(instr_mod_tags);
                $scope.method = "/api/modules/tags";
            } else if (selected.includes("Degrees")) {
                $("#example-entries").html(example_degrees);
                $("#warning_p").html(warning_degrees);
                $("#expand-examples").css("width", "35%");
                $("#init_instructions").html(instr_degrees);
                $scope.method = "/api/degrees";
            } else if (selected.includes("Degree-Module")) {
                $("#example-entries").html(example_deg_mod);
                $("#warning_p").html(warning_deg_mod);
                $("#init_instructions").html(instr_deg_mod);
                $("#expand-examples").css("width", "30%");
                $scope.method = "/api/degrees/modules";
            } else if (selected.includes("Module Dep")) {
                $("#example-entries").html(example_dep);
                $("#warning_p").html(warning_module_dep);
                $("#init_instructions").html(instr_dep);
                $("#expand-examples").css("width", "30%");
                $scope.method = "/api/degrees/modules/dependencies";
            } else if (selected.includes("Module Rec")) {
                $("#example-entries").html(example_rec);
                $("#warning_p").html(warning_module_dep);
                $("#init_instructions").html(instr_rec);
                $("#expand-examples").css("width", "30%");
                $scope.method = "/api/degrees/modules/recommendations";
            } else {
                $("#example-entries").html("");
                $("#warning_p").html("");
                $("#init_instructions").html("");
                $scope.method = "";
            }

        });

        /** 
         *Send a reqest form to the server to process the CSV file uploaded
         */
        $scope.uploadFile = function () {
            if (!$("#fileName").text().includes("No File Selected") && somethingSelected) {
                var request = {
                    method: 'POST',
                    url: $scope.method,
                    data: formdata,
                    headers: {
                        'Content-Type': undefined,
                        'x-insert-type': 'BULK'
                    }
                };
                
                $http(request)
                    .success(function (d) {
                        $("#bulk_alert").html("<p style='width:30%;margin-top:2%' class='alert success'>Data Has Successfully Been Uploaded</p>");
                    })
                    .error(function (d, c) {
                        $("#bulk_alert").html("<p class='alert' style=' width: 400px; margin-top:2%;'> <i style='padding-right:5px' class='glyphicon glyphicon-warning-sign'></i> Error! <br/> <strong> Make Sure You: </strong><br/> - Have Selected a CSV File, Other Formats Are Not Accepted <br/> - Have Selected The Correct Category <br/> - Are Aware Of And Have Followed All The Rules For That Specific Type <br/> <strong> Refer To The Examples Above To Verify Your Input </strong>  </p> ");
                    });
            } else {
                $("#bulk_alert").html("<p class='alert' style=' width: 400px; margin-top:15px;'> <i style='padding-right:10px' class='glyphicon glyphicon-warning-sign'></i> Please Select a File Or/And A Category</p>");
            }
        }
    }
});
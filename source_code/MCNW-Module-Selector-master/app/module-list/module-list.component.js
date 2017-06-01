angular.
module('moduleList', ['ui.bootstrap', 'ngRoute', 'ngCookies']).component('moduleList', {
    templateUrl: 'module-list/module-list.template.html',
    controller: function ModuleListController(newTracked, $http, $scope, $uibModal, $cookies, Store, Faculty) {
		    /**
         *@module Module List Controller
         */
    
        $("title").html("Search Modules");
        var self = this;
        if ($('#filters').is(":visible")) {
            this.filtersHidden = false;
        } else {
            this.filtersHidden = true;
            $('#filters').addClass('slidable');
            $('#filters').addClass('view');
        }


        if ($cookies.get("firstTime") != null) {
            $scope.$modalInstance = $uibModal.open({
                templateUrl: "module-list/tutorial-modal.template.html",
                scope: $scope
            });
            $scope.closeTutorial = function () {
                $scope.$modalInstance.close();
                $cookies.remove("firstTime");
            };
        }

        /**
         *Function used to retrieve the cookie that is being used currently. The cookie stores data such as which user is currently using the website.
         */
        var getCookie = function () {
            var cookie = $cookies.get("selector_user");
            if (cookie != undefined) {
                try {
                    var cookiedata = JSON.parse(cookie.substring(2, cookie.length));
                    return cookiedata;
                } catch (err) {
                    return null;
                }
            }
            return null;
        }

        /**
         *Function used to retrieve the loginDetails of the user currently using the website.
         */
        var getLogInDetails = function () {
                var cookie = getCookie();
                if (cookie != null) {
                    return cookie;
                } else {
                    $http.get('/logged_in').then(function successCallback(response) {
                        return response.data;

                    }, function errorCallback() {
                        return null;

                    });

                }
            }
            /*
        function isScrolledIntoView(elem) {
          var docViewTop = $(window).scrollTop();
          var docViewBottom = docViewTop + $(window).height();
          var elemTop = $(elem).offset().top;
          var elemBottom = elemTop + $(elem).height();
          return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
        }
      
        var searchBarYPos = null;
      
        $scope.window.onscroll = function() {
          if (!isScrolledIntoView($('#searchBar'))) {
            searchBarYPos = $(window).scrollTop();
            $('#searchBar').addClass("affix");
          }
          else if (searchBarYPos !== null && searchBarYPos > $(window).scrollTop()) {
             $('#searchBar').removeClass("affix");
          }
          
        };
        */

        /**
         *When the document is ready this will load up the search bar and apply the affix attribute to it.
         *When a user scrolls below 120 pixels the search bar will move and fix to the top right of the website.
         */
        $(document).ready(function () {
            if ($("#searchBar").length > 0) {
                $('#searchBar').affix({
                    offset: {
                        top: 120,
                        bottom: function () {
                            return (this.bottom = $('.footer').outerHeight(true))
                        }
                    }
                });
            }
        });
        /*
           var logged_in = getLogInDetails();
           if(logged_in!=null){
            if (logged_in.FName != undefined) {
                $("#user_id").html("Hello, " + logged_in.FName + " " + logged_in.LName);
            } else {
                $("#user_id").html("Sign In");
            }
           }else{
             $("#user_id").html("Sign In");
          } */

        var self = this;
        this.newModules = [];
        this.orderProp = 'Name';
        this.gQuery = '';
        this.yearQuery = '';
        this.creditQuery = '';
        this.searchQuery = '';
        this.facultyQuery = '';
        this.myFaculty = Faculty.get();
        this.queryName = '';
        var tagSet = [];
        self.currentPage = 1;
        self.perPage = 5;
        self.prevDisabled = true;
        //Default values for the ng-hide of the Years tags
        self.year4 = false;
        self.year5 = false;
        self.year6 = false;
        self.year7 = false;
        self.year8 = false;
        //contains all the credits
        this.allCredits = [];

        if (Faculty.get() != null) {
            this.facultyQuery = '&faculty=' + Faculty.get() + '&';
        }

        /**
         *This function is called when the Tags are finished sorting out. It colours all selected tags as white,
         *and must be called once the ng-repeat for the tags has finished.
         */
        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            tagSet.forEach(function (item, array) {
                document.getElementById(item.substr(4, item.length)).style.color = 'white';
            })
            if (tagSet.length == 0) {
                document.getElementById('All').style.color = 'white';
            } else {
                document.getElementById('All').style.color = '#4395B4';
            }
        });

        /**
         *Keeps track on the 'results per page' select element. When changed this function will be triggered.
         */
        this.change = function () {
            var query = 'api/modules?' + self.gQuery + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1);
            $http.get(query).then(function (response) {
                self.modules = response.data.data;
                self.totalModules = response.data.total;
                var totalPages = Math.ceil(self.totalModules / self.perPage);
                self.prevDisabled = true;
                if (totalPages > 1) {
                    self.nextDisabled = false;
                } else {
                    self.nextDisabled = true;
                }
            });
        }

        /**
         *Function for pagination next button
         */
        self.next = function next() {
            var totalPages = Math.ceil(self.totalModules / self.perPage);
            if (self.currentPage + 1 == totalPages) {
                self.nextDisabled = true;
                self.prevDisabled = false;
            } else if (self.currentPage + 1 < totalPages) {
                self.prevDisabled = false;
            }

            self.currentPage += 1;
            $http.get('/api/modules?' + self.gQuery + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1)).then(function (response) {
                self.modules = response.data.data;
                $('html, body').animate({
                    scrollTop: 0
                }, 'fast');
            });
        }

        /*
         *Function for pagination prev button
         */
        self.prev = function prev() {
            var totalPages = Math.ceil(self.totalModules / self.perPage);
            if (self.currentPage - 1 == 1) {
                self.prevDisabled = true;
                self.nextDisabled = false;
            } else if (self.currentPage - 1 < totalPages) {
                self.nextDisabled = false;
            }
            self.currentPage = self.currentPage - 1;
            $http.get('/api/modules?' + self.gQuery + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1)).then(function (response) {
                self.modules = response.data.data;
                $('html, body').animate({
                    scrollTop: 0
                }, 'fast');
            });
        }
        $http.get('/api/modules?per_page=' + self.perPage + self.facultyQuery + '&page=' + (self.currentPage - 1)).then(function (response) {
            var logged_in = getLogInDetails();
            if (logged_in != null) {
                self.user = logged_in.UserID;
                $http.get('/api/users/' + self.user + '/modules').then(function (response2) {
                    Store.set(response2.data.data);
                });

            }

            self.modules = response.data.data;

            $http.get('/api/modules?' + self.facultyQuery).then(function (response) {
                self.totalModules = response.data.total;

                var totalPages = Math.ceil(self.totalModules / self.perPage);

                if (totalPages == 1) {
                    self.nextDisabled = true;
                }

                if (self.totalModules == 0) {
                    self.emptyModules = 1;
                } else {
                    self.emptyModules = 0;
                }
            })

        });
        $http.get('/api/modules?' + self.facultyQuery).then(function (response) {
            var allModules = response.data.data;
            self.categoryToTag = new Map();
            self.tagCategories = [];
            var allModuleIDs = [];
            var allModuleTags = [];
            self.year4 = true;
            self.year5 = true;
            self.year6 = true;
            self.year7 = true;
            self.year8 = true;
            for (var key in allModules) {
                if (allModules.hasOwnProperty(key)) {
                    allModuleIDs.push('module=' + allModules[key].ModuleID);
                }
                //GETTING ALL THE CREDITS
                if (self.allCredits.indexOf(allModules[key].Credits) == -1) {
                    self.allCredits.push(allModules[key].Credits);
                }
                //GETTING ALL THE YEARS
                var currentYear = allModules[key].Year;
                if (currentYear == 8) {
                    self.year8 = false;
                } else if (currentYear == 4) {
                    self.year4 = false;
                } else if (currentYear == 5) {
                    self.year5 = false;
                } else if (currentYear == 6) {
                    self.year6 = false;
                } else if (currentYear == 7) {
                    self.year7 = false;
                } else {
                    self.year4 = false;
                    self.year5 = false;
                    self.year6 = false;
                    self.year7 = false;
                    self.year8 = false;
                }
            }
            var query = '';
            allModuleIDs.forEach(function (item, array) {
                query += item + '&';
            });
            $http.get('/api/modules/tags?' + query).then(function (response) {
                allModuleTags = response.data;
                for (var key in allModuleTags) {
                    if (allModuleTags.hasOwnProperty(key)) {
                        if (self.tagCategories.indexOf(allModuleTags[key].Category) == -1) {
                            self.tagCategories.push(allModuleTags[key].Category);
                        }
                    }
                };

                var indexOfNull = self.tagCategories.indexOf(null);

                if (indexOfNull != -1) {
                    self.tagCategories.splice(self.tagCategories.indexOf(null), 1);
                    self.tagCategories.push(null);
                }

                self.tagCategories.sort();

                self.tagCategories.forEach(function (item, array) {
                    var name = item;
                    var inCategory = [];
                    for (var key in allModuleTags) {
                        if (allModuleTags.hasOwnProperty(key)) {
                            if (allModuleTags[key].Category == name) {
                                inCategory.push(allModuleTags[key].TagName);
                            }
                        }
                    }
                    self.categoryToTag.set(name, inCategory);
                });
            });
        });

        /**
         *Used in ng-if to decide whether a pushpin should be red or white.
         */
        self.isTracked = function isTracked(moduleID) {
            var exists = 0;
            for (var key in Store.get()) {
                if (Store.get().hasOwnProperty(key)) {
                    if (Store.get()[key].ModuleID == moduleID) {
                        exists = 1;
                        break;
                    }
                }
            }
            return exists;
        }

        /**
         *Used in ng-if to decide whether a pushpin should be red or white.
         */
        self.isNotTracked = function isNotTracked(moduleID) {
            var exists = 1;
            for (var key in Store.get()) {
                if (Store.get().hasOwnProperty(key)) {
                    if (Store.get()[key].ModuleID == moduleID) {
                        exists = 0;
                        break;
                    }
                }
            }
            return exists;
        }

        /**
         *Called when a user clicks on a pushpin. If already tracked it will remove the module otherwise it will add it to the users tracked modules.
         *@param {string} moduleID - The module in which you wish to track/untrack.
         */
        self.tracked = function tracked(moduleID) {
            if (self.isTracked(moduleID)) {
                $http.delete('/api/users/' + getLogInDetails().UserID + '/modules/' + moduleID).then(function (response) {
                    $http.get('/api/users/' + getLogInDetails().UserID + '/modules').then(function (response1) {
                        Store.set(response1.data.data);

                        if (newTracked.getNewMods().indexOf(moduleID) > -1) {

                            var newTrack = newTracked.getNumber();
                            if (newTrack != 0) {
                                newTrack = newTrack - 1;
                            }
                            newTracked.setNumber(newTrack);
                            $scope.$emit('handleEmit', {
                                number: newTrack
                            });
                        }
                    })
                })
            } else {

                var tagsSelected = [];

                tagSet.forEach(function (item, array) {
                    var input = item.slice(4);
                    tagsSelected.push(input);
                });

                var newModsTracked = newTracked.getNewMods();
                newModsTracked.push(moduleID);
                newTracked.setNewMods(newModsTracked);

                $http.post('/api/users/modules', {
                    "userID": getLogInDetails().UserID,
                    "moduleID": moduleID,
                    "tagIDArray": tagsSelected
                }).then(function (response) {
                    $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                        Store.set(response1.data.data)
                        var newTrack = newTracked.getNumber();
                        newTrack = newTrack + 1;
                        newTracked.setNumber(newTrack);
                        $scope.$emit('handleEmit', {
                            number: newTrack
                        });
                    })
                })
            }
        };

        /**
         *Called everytime a user selects a tag to filter the tags down so that only tags which will result in a result are displayed.
         */
        self.updateTags = function updateTags() {
            $http.get('/api/modules?' + self.gQuery + self.creditQuery + self.facultyQuery + self.yearQuery + self.searchQuery).then(function (response) {
                var allModules = response.data.data;
                self.categoryToTag.clear();
                self.tagCategories = [];
                var allModuleIDs = [];
                var allModuleTags = [];
                self.allCredits = [];
                self.year4 = true;
                self.year5 = true;
                self.year6 = true;
                self.year7 = true;
                self.year8 = true;
                for (var key in allModules) {
                    if (allModules.hasOwnProperty(key)) {
                        allModuleIDs.push('module=' + allModules[key].ModuleID);
                    }

                    //getting all credits
                    if (self.allCredits.indexOf(allModules[key].Credits) == -1) {
                        self.allCredits.push(allModules[key].Credits);
                    }
                    //GETTING ALL THE YEARS
                    var currentYear = allModules[key].Year;
                    if (currentYear == 8) {
                        self.year8 = false;
                    } else if (currentYear == 4) {
                        self.year4 = false;
                    } else if (currentYear == 5) {
                        self.year5 = false;
                    } else if (currentYear == 6) {
                        self.year6 = false;
                    } else if (currentYear == 7) {
                        self.year7 = false;
                    } else {
                        self.year4 = false;
                        self.year5 = false;
                        self.year6 = false;
                        self.year7 = false;
                        self.year8 = false;
                    }
                }
                var query = '';
                allModuleIDs.forEach(function (item, array) {
                    query += item + '&';
                });
                $http.get('/api/modules/tags?' + query).then(function (response) {
                    allModuleTags = response.data;
                    for (var key in allModuleTags) {
                        if (allModuleTags.hasOwnProperty(key)) {
                            if (self.tagCategories.indexOf(allModuleTags[key].Category) == -1) {
                                self.tagCategories.push(allModuleTags[key].Category);
                            }
                        }
                    };
                    var indexs = self.tagCategories.indexOf(null);
                    if (indexs > -1) {
                        self.tagCategories.splice(indexs, 1);
                        self.tagCategories.push(null);
                    }

                    self.tagCategories.sort();

                    self.tagCategories.forEach(function (item, array) {
                        var name = item;
                        var inCategory = [];
                        for (var key in allModuleTags) {
                            if (allModuleTags.hasOwnProperty(key)) {
                                if (allModuleTags[key].Category == name) {
                                    inCategory.push(allModuleTags[key].TagName);
                                }
                            }
                        }
                        self.categoryToTag.set(name, inCategory);
                    });
                });
                //This servers for hiding Years which are not available
                if (self.gQuery != '' || self.creditQuery != '' || self.searchQuery != '') {
                    self.year4 = true;
                    self.year5 = true;
                    self.year6 = true;
                    self.year7 = true;
                    self.year8 = true;
                    for (var i = 0; i < allModules.length; i++) {
                        var currentYear = allModules[i].Year;
                        if (currentYear == 8) {
                            self.year8 = false;
                        } else if (currentYear == 4) {
                            self.year4 = false;
                        } else if (currentYear == 5) {
                            self.year5 = false;
                        } else if (currentYear == 6) {
                            self.year6 = false;
                        } else if (currentYear == 7) {
                            self.year7 = false;
                        }
                    }
                }
            });
        }

        /**
         *Used to expand the tag filters.
         */
        self.showMore = function showMore() {
            document.getElementById('lessFilter').style.display = 'none';
            document.getElementById('moreFilter').style.display = 'block';
        }

        /**
         *Used to collapse the tag filters.
         */
        self.showLess = function showLess() {
            document.getElementById('lessFilter').style.display = 'block';
            document.getElementById('moreFilter').style.display = 'none';
        }

        $("#sign_out_btn").click(function () {
            $http.get("/logout");
            $("#user_id").html("Sign In");
        });

        $scope.open = function ($code, $name, $description, $cw, $credits) {
            var exam = 100 - $cw;
            $scope.$modalInstance = $uibModal.open({
                templateUrl: 'modal-instance/modal-instance.template.html',
                scope: $scope
            });
            $scope.close = function () {
                $scope.$modalInstance.close();
            };

            $scope.code = $code;
            $scope.name = $name;
            $scope.description = $description;
            $scope.cw = $cw;
            $scope.credits = $credits;
            $scope.exam = exam;

            $scope.isTracked = function isTracked(moduleID) {
                var exists = 0;
                for (var key in Store.get()) {
                    if (Store.get().hasOwnProperty(key)) {
                        if (Store.get()[key].ModuleID == moduleID) {
                            exists = 1;
                            break;
                        }
                    }
                }
                return exists;
            }
            $scope.isNotTracked = function isNotTracked(moduleID) {
                var exists = 1;
                for (var key in Store.get()) {
                    if (Store.get().hasOwnProperty(key)) {
                        if (Store.get()[key].ModuleID == moduleID) {
                            exists = 0;
                            break;
                        }
                    }
                }
                return exists;
            }
            $scope.tracked = function tracked(moduleID) {
                if (self.isTracked(moduleID)) {
                    $http.delete('/api/users/' + self.user + '/modules/' + moduleID).then(function (response) {
                        $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                            Store.set(response1.data.data)

                            if (newTracked.getNewMods().indexOf(moduleID) > -1) {

                                var newTrack = newTracked.getNumber();
                                if (newTrack != 0) {
                                    newTrack = newTrack - 1;
                                }
                                newTracked.setNumber(newTrack);
                                $scope.$emit('handleEmit', {
                                    number: newTrack
                                });
                            }

                        })
                    })
                } else {
                    var newModsTracked = newTracked.getNewMods();
                    newModsTracked.push(moduleID);
                    newTracked.setNewMods(newModsTracked);

                    $http.post('/api/users/modules', {
                        "userID": self.user,
                        "moduleID": moduleID
                    }).then(function (response) {
                        $http.get('/api/users/' + self.user + '/modules').then(function (response1) {
                            Store.set(response1.data.data)
                            var newTrack = newTracked.getNumber();
                            newTrack = newTrack + 1;
                            newTracked.setNumber(newTrack);
                            $scope.$emit('handleEmit', {
                                number: newTrack
                            });
                        })
                    })
                }
            };
        }

        /**
         *Called when a user selects a tag. The website checks which tag it is and whether or not it is alreadys selected.
         *Then decides which action is best to be taken later.
         */
        self.pressedTag = function pressedTag(tagName) {
                if (tagName == 'All') {
                    self.gQuery = '';
                    self.currentPage = 1;
                    tagSet = [];
                    query = 'api/modules?' + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1);
                    self.updateTags();
                } else if (tagSet.indexOf('tag=' + tagName) > -1) {
                    self.currentPage = 1;
                    tagSet.splice(tagSet.indexOf('tag=' + tagName), 1);
                    if (tagSet.length == 0) {
                        query = 'api/modules?' + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1);
                        self.gQuery = '';
                        self.updateTags('Again', tagName);
                    } else {
                        query = '';
                        tagSet.forEach(function (item, array) {
                            query += item + '&';
                        });
                        self.gQuery = query;
                        self.updateTags('Again', tagName);
                        query = '/api/modules?' + query + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1);
                    }
                } else {
                    self.currentPage = 1;
                    var query = 'tag=' + tagName;
                    query.replace(' ', '%20');
                    tagSet.push(query);
                    query = '';
                    tagSet.forEach(function (item, array) {
                        query += item + '&';
                    });
                    self.gQuery = query;
                    self.updateTags('New', tagName);
                    query = '/api/modules?' + query + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1);
                }
                $http.get(query).then(function (response) {
                    self.modules = response.data.data;
                    self.totalModules = response.data.total;
                    var totalPages = Math.ceil(self.totalModules / self.perPage);
                    self.prevDisabled = true;
                    if (totalPages > 1) {
                        self.nextDisabled = false;
                    } else {
                        self.nextDisabled = true;
                    }
                });
            }
            /**
             *Function for filtering based on the year selected.
             */
        self.filterYear = function filterYear(selectedYear) {
            if (selectedYear != 0) {
                self.currentPage = 1;
                self.yearQuery = 'year=' + selectedYear + "&";
                $http.get('api/modules?' + self.gQuery + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1)).then(function (response) {
                    self.modules = response.data.data;
                    self.totalModules = response.data.total;
                    var totalPages = Math.ceil(self.totalModules / self.perPage);
                    self.prevDisabled = true;
                    if (totalPages > 1) {
                        self.nextDisabled = false;
                    } else {
                        self.nextDisabled = true;
                    }
                });
                self.updateTags();
            } else {
                self.currentPage = 1;
                self.yearQuery = '';
                $http.get('api/modules?' + self.gQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1)).then(function (response) {
                    self.modules = response.data.data;
                    self.totalModules = response.data.total;
                    var totalPages = Math.ceil(self.totalModules / self.perPage);
                    self.prevDisabled = true;
                    if (totalPages > 1) {
                        self.nextDisabled = false;
                    } else {
                        self.nextDisabled = true;
                    }
                });
                self.updateTags();
            }
        }

        /**
         *Function for filtering Credits.
         */
        self.filterCredit = function filterCredit(selectedCredit) {
            if (selectedCredit != -1) {
                self.currentPage = 1;
                self.creditQuery = 'credits=' + selectedCredit + '&';
                $http.get('api/modules?' + self.gQuery + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1)).then(function (response) {
                    self.modules = response.data.data;
                    self.totalModules = response.data.total;
                    var totalPages = Math.ceil(self.totalModules / self.perPage);
                    self.prevDisabled = true;
                    if (totalPages > 1) {
                        self.nextDisabled = false;
                    } else {
                        self.nextDisabled = true;
                    }
                });
                self.updateTags();
            } else {
                self.currentPage = 1;
                self.creditQuery = '';
                $http.get('api/modules?' + self.gQuery + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1)).then(function (response) {
                    self.modules = response.data.data;
                    self.totalModules = response.data.total;
                    var totalPages = Math.ceil(self.totalModules / self.perPage);
                    self.prevDisabled = true;
                    if (totalPages > 1) {
                        self.nextDisabled = false;
                    } else {
                        self.nextDisabled = true;
                    }
                });
                self.updateTags();
            }
        }

        /**
         *Function for filtering via searchbar when the user presses enter.
         */
        self.filterSearch = function filterSearch(keyEvent) {
            if (keyEvent.which === 13) {
                self.searchQuery = "module_name=" + self.queryName + "&";
                $http.get('api/modules?' + self.gQuery + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1)).then(function (response) {
                    self.modules = response.data.data;

                    if (self.modules.length == 0) {
                        self.emptyModules = 1;
                    } else {
                        self.emptyModules = 0;
                    }

                    self.totalModules = response.data.total;
                    var totalPages = Math.ceil(self.totalModules / self.perPage);
                    self.prevDisabled = true;
                    if (totalPages > 1) {
                        self.nextDisabled = false;
                    } else {
                        self.nextDisabled = true;
                    }
                });
            }
            self.updateTags();
        }

        /**
         *FilterSearch funtion version used when a user clicks on the search button.
         */
        self.filterSearchButton = function filterSearchButton() {
            self.searchQuery = "module_name=" + self.queryName + "&";
            $http.get('api/modules?' + self.gQuery + self.yearQuery + self.creditQuery + self.facultyQuery + self.searchQuery + '&per_page=' + self.perPage + '&page=' + (self.currentPage - 1)).then(function (response) {
                self.modules = response.data.data;

                if (self.modules.length == 0) {
                    self.emptyModules = 1;
                } else {
                    self.emptyModules = 0;
                }

                self.totalModules = response.data.total;
                var totalPages = Math.ceil(self.totalModules / self.perPage);
                self.prevDisabled = true;
                if (totalPages > 1) {
                    self.nextDisabled = false;
                } else {
                    self.nextDisabled = true;
                }
            });
            self.updateTags();
        }

    }
}).directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit(attr.onFinishRender);
                });
            }
        }
    }
});
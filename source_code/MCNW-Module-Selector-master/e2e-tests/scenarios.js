var db = require('../server/config/connect_db.js');

describe('Actions whilst signed out', function () {

    require('../e2e_test_setup.js');

    it('should redirect index.html to index.html#!/index', function () {
        browser.get('index.html');
        browser.waitForAngular();

        expect(browser.getLocationAbsUrl()).toBe('/select-faculty');
    })

    describe('Creating an account', function () {

        var connection;

        beforeEach(function (done) {

            db.getConnection(function (err, con) {
                if (err) {
                    done(err);
                } else {
                    connection = con;
                    done();
                }
            });

        })

        afterEach(function (done) {
            if (connection) {
                connection.release();
                done()
            }
        })

        browser.get('index.html');
        browser.waitForAngular();

        it('should move to the sign in page', function () {
            element(by.id('sign_in')).click();
            expect(browser.getLocationAbsUrl()).toBe('/sign-in');
        })

        browser.get('index.html#!/sign-in');
        browser.waitForAngular();

        it('should move to the create account page', function () {
            element(by.linkText('Create Account')).click();
            expect(browser.getLocationAbsUrl()).toBe('/create-account');
        })

        browser.get('index.html#!/create-account');
        browser.waitForAngular();

        it('should correctly add my account to the database', function (done) {
            var Firstname = element(by.id('f_name_input'));
            var Surname = element(by.id('l_name_input'));
            var email = element(by.id('email_input'));
            var pword = element(by.id('pwd_input'));
            var cpword = element(by.id('pwd_confirm_input'));

            Firstname.sendKeys('Hani');
            Surname.sendKeys('Tawil');
            email.sendKeys('tawil.hani@gmail.com');
            pword.sendKeys('mcnwmcnw');
            cpword.sendKeys('mcnwmcnw');

            element(by.id('acc_btn')).click();

            connection.query('Select * from User Where UserID = ?', ['tawil.hani@gmail.com'], function (err, rows) {
                try {
                    expect(err).toEqual(null);
                    expect(rows[0].UserID).toBe('tawil.hani@gmail.com');
                    expect(rows[0].FName).toBe('Hani');
                    expect(rows[0].LName).toBe('Tawil');
                    expect(rows[0].AccessGroup).toBe('2');

                } catch (e) {
                    done(e);
                }
            });
        });
    })
})

describe('Admin Actions', function () {
    require('../e2e_test_setup.js');

    describe('Admin options', function () {

        var connection;

        beforeAll(function (done) {

            db.getConnection(function (err, con) {
                if (err) {
                    done(err);
                } else {
                    connection = con;
                    done();
                }
            });

        })

        //                beforeEach(function () {
        //                    browser.get('index.html#!/sign-in');
        //                    browser.waitForAngular();
        //        
        //                    var email = element(by.id('email_input'));
        //                    var Surname = element(by.id('pwd_input'));
        //        
        //                    email.sendKeys('testuser');
        //                    Surname.sendKeys('testpassword');
        //        
        //                    element(by.id('sign_in_btn')).click();
        //                    browser.waitForAngular();
        //                })

        afterAll(function (done) {
            if (connection) {
                connection.release();
                done()
            }
        })

        it('should log in as admin', function () {
            browser.get('index.html#!/sign-in');
            browser.waitForAngular();

            var email = element(by.id('email_input'));
            var Surname = element(by.id('pwd_input'));

            email.sendKeys('testuser');
            Surname.sendKeys('testpassword');

            element(by.id('sign_in_btn')).click();
            browser.waitForAngular();

        })

        browser.get('index.html#!/create-course');
        browser.waitForAngular();

        it('should be able to add a new course to the database', function (done) {
            browser.get('index.html#!/create-course');
            browser.waitForAngular();

            var courseName = element(by.id('course_name'));

            courseName.sendKeys('Medicine');
            element(by.cssContainingText('option', '4')).click();
            element(by.cssContainingText('option', '4CCS1FC1')).click();
            element(by.cssContainingText('option', '4CCS2DBS')).click();

            element(by.id('create_course_btn')).click();

            connection.query('Select * from Degree Where DegreeTitle = ?', ['Medicine'], function (err, rows) {
                try {
                    expect(err).toEqual(null);
                    expect(rows[0].DegreeTitle).toBe('Medicine');
                    expect(rows[0].LengthOfStudy).toBe('4');

                } catch (e) {
                    done(e);
                }
            });
        })

        it('should be able to add a new module to the database', function (done) {
            browser.get('index.html#!/create-module');
            browser.waitForAngular();

            var moduleID = element(by.id('module_code'));
            var moduleName = element(by.id('module_name'));
            var moduleDesc = element(by.id('description_box'));
            element(by.cssContainingText('option', '4')).click();
            element(by.cssContainingText('option', '15')).click();
            element(by.cssContainingText('option', 'Tuesday')).click();
            var moduleTime = element(by.id('time_input'));
            var modulePerc = element(by.id('cw_perc_input'));
            element(by.cssContainingText('option', 'Faculty of Social Science and Public Policy')).click();
            element(by.cssContainingText('option', 'BSc')).click();


            moduleID.sendKeys('5CCS2DST');
            moduleName.sendKeys('Data Structures');
            moduleDesc.sendKeys('Testing the waters just in case the shark comes to eat me');
            moduleTime.sendKeys('12:00:00');
            modulePerc.sendKeys('15');

            element(by.id('create_module_btn')).click();

            connection.query('Select * from Module Where ModuleID = ?', ['5CCS2DST'], function (err, rows) {
                try {
                    expect(err).toEqual(null);
                    expect(rows[0].moduleID).toBe('5CCS2DST');
                    expect(rows[0].Name).toBe('Data Structures');
                    expect(rows[0].Description).toBe('Testing the waters just in case the shark comes to eat me');
                    expect(rows[0].Year).toBe('4');
                    expect(rows[0].Credits).toBe('15');
                    expect(rows[0].LectureDay).toBe('Tuesday');
                    expect(rows[0].LectureTime).toBe('12:00:00');
                    expect(rows[0].CourseworkPercentage).toBe('15');
                    expect(rows[0].Faculty).toBe('Faculty of Social Science and Public Policy');

                } catch (e) {
                    done(e);
                }
            });
        })

        it('should be able to add a new tag to the database', function (done) {
            browser.get('index.html#!/create-tags');
            browser.waitForAngular();

            var courseName = element(by.id('tag-name'));

            courseName.sendKeys('Medicine');
            element(by.cssContainingText('option', 'Careers')).click();

            element(by.id('create-tag-button')).click();

            connection.query('Select * from Tag Where TagName = ?', ['Medicine'], function (err, rows) {
                try {
                    expect(err).toEqual(null);
                    expect(rows[0].TagName).toBe('Medicine');
                    expect(rows[0].Category).toBe('Careers');

                } catch (e) {
                    done(e);
                }
            });
        })

        it('should be able to filter the search space in the edit course page', function (done) {
            browser.get('index.html#!/edit-course');
            browser.waitForAngular();

            var courseList = element.all(by.repeater('degree in degrees'));
            var query = element(by.model('$ctrl.query.Name'));

            query.sendKeys('bio');
            expect(courseList.count()).toBe(2);

            query.clear();

            query.sendKeys('Bsc');
            expect(courseList.count()).toBe(4);
            done();
        })

        //        it('should be able to change the year of a course', function (done) {
        //            //            browser.get('index.html#!/sign-in');
        //            //            browser.waitForAngular();
        //            //
        //            //            var email = element(by.id('email_input'));
        //            //            var Surname = element(by.id('pwd_input'));
        //            //
        //            //            email.sendKeys('testuser');
        //            //            Surname.sendKeys('testpassword');
        //            //
        //            //            element(by.id('sign_in_btn')).click();
        //            //            browser.waitForAngular();
        //
        //            browser.get('index.html#!/edit-course');
        //            browser.waitForAngular();
        //
        //            element(by.cssContainingText('span', 'BSc Computer Science')).click();
        //            element(by.cssContainingText('option', '4')).click();
        //            element(by.id('edit_module_btn')).click().then(function () {
        //                connection.query('Select * from Degree Where DegreeTitle = ?', ['BSc Computer Science'], function (err, rows) {
        //                    try {
        //                        expect(err).toEqual(null);
        //                        expect(rows[0].DegreeTitle).toBe('BSc Computer Science');
        //                        expect(rows[0].LengthOfStudy).toBe(4);
        //
        //                    } catch (e) {
        //                        done(e);
        //                    }
        //                });
        //            })
        //
        //            done();
        //        })

        it('should be able to add modules to a degree', function (done) {
            browser.get('index.html#!/edit-course');
            browser.waitForAngular();

            element(by.cssContainingText('span', 'BSc Computer Science')).click();
            element(by.cssContainingText('option', '4')).click();
            element(by.cssContainingText('option', '5CCS1FC2')).click();

            element(by.id('edit_module_btn')).click().then(function () {
                connection.query('select * from DegreeModule where DegreeID = \'BSc Computer Science\' AND ModuleID = \'5CCS1FC2\'', function (err, rows) {
                    try {
                        expect(err).toEqual(null);
                        expect(rows[0].DegreeID).toBe('BSc Computer Science');
                        expect(rows[0].ModuleID).toBe('5CCS1FC2');

                    } catch (e) {
                        done(e);
                    }
                });
            })

            done();
        })

        it('should be able to filter the search space in the edit module page', function (done) {
            browser.get('index.html#!/edit-module');
            browser.waitForAngular();

            var moduleList = element.all(by.repeater('module in modules'));
            var query = element(by.model('$ctrl.query.Name'));

            expect(moduleList.count()).toBe(5);

            query.clear();

            query.sendKeys('FC');
            expect(moduleList.count()).toBe(2);

            query.clear();
            query.sendKeys('DBS');
            expect(moduleList.count()).toBe(1);

            done();
        })

        it('should be able to remove modules', function (done) {
            browser.get('index.html#!/edit-module');
            browser.waitForAngular();

            element(by.css('i.glyphicon.glyphicon-trash')).click();

            var EC = protractor.ExpectedConditions;
            browser.wait(EC.alertIsPresent(), 5000, "Alert is not getting present")

            browser.switchTo().alert().accept();

            connection.query('select * from Module where ModuleID = \'4CCS1FC1\'', function (err, rows) {
                try {
                    expect(err).toEqual(null);
                    expect(rows[0].ModuleID).toBe('4CCS1FC1');

                } catch (e) {
                    done(e);
                }
            });

            done();
        })

        it('should be able to remove modules', function (done) {
            browser.get('index.html#!/edit-module');
            browser.waitForAngular();

            var module = element.all(by.repeater('module in modules').row(0).column('module.ModuleID'));

            expect(module.getText()).toEqual(['4CCS2DBS']);

            element(by.css('i.glyphicon.glyphicon-trash')).click();

            var EC = protractor.ExpectedConditions;
            browser.wait(EC.alertIsPresent(), 5000, "Alert is not getting present")

            browser.switchTo().alert().accept();

            browser.waitForAngular();

            browser.get('index.html#!/edit-module');
            browser.waitForAngular();

            var module = element.all(by.repeater('module in modules').row(0).column('module.ModuleID'));

            expect(module.getText()).toEqual(['4SSMN110']);

            done();
        })

        it('should be able to edit a module', function (done) {
            browser.get('index.html#!/edit-module');
            browser.waitForAngular();

            var module = element.all(by.repeater('module in modules').row(0)).click();

            element(by.cssContainingText('option', '5')).click();
            element(by.cssContainingText('option', '30')).click();
            element(by.cssContainingText('option', 'Faculty of Natural and Mathematical Sciences')).click();

            element(by.id('edit_module_btn')).click();
            browser.waitForAngular();

            browser.get('index.html#!/edit-module');
            browser.waitForAngular();

            var module = element.all(by.repeater('module in modules').row(0)).click();

            var credit = element(by.id('select_credits')).element(by.css('option:checked')).getText();

            expect(credit).toBe('30');

            done();
        })

        it('should be able to filter the search space in the edit tag page', function (done) {
            browser.get('index.html#!/edit-tags');
            browser.waitForAngular();

            var tagList = element.all(by.repeater('tag in tags'));
            var query = element(by.model('$ctrl.query.Name'));

            expect(tagList.count()).toBe(18);

            query.sendKeys('BSc');
            expect(tagList.count()).toBe(3);

            query.clear();
            query.sendKeys('Astrology');
            expect(tagList.count()).toBe(1);
            query.clear();

            done();
        })

        it('should be able to remove tags', function (done) {
            browser.get('index.html#!/edit-tags');
            browser.waitForAngular();

            var tag = element.all(by.repeater('tag in tags').row(0).column('tag.TagName'));

            expect(tag.getText()).toEqual(['Astrology']);

            element(by.css('i.glyphicon.glyphicon-trash')).click();

            var EC = protractor.ExpectedConditions;
            browser.wait(EC.alertIsPresent(), 5000, "Alert is not getting present")

            browser.switchTo().alert().accept();

            browser.waitForAngular();

            browser.get('index.html#!/edit-tags');
            browser.waitForAngular();

            var tag = element.all(by.repeater('tag in tags').row(0).column('tag.TagName'));

            expect(tag.getText()).toEqual(['BSc']);

            done();
        })

        it('should be able to edit tags', function (done) {
            browser.get('index.html#!/edit-tags');
            browser.waitForAngular();

            element.all(by.repeater('tag in tags').row(0).column('tag.TagName')).click();

            var currentCategory = element(by.id('tag_category')).element(by.css('option:checked')).getText();

            expect(currentCategory).toEqual('');

            element(by.cssContainingText('option', 'Degree')).click();

            element(by.id('edit_module_btn')).click();
            browser.waitForAngular();

            browser.get('index.html#!/edit-tags');
            browser.waitForAngular();

            element.all(by.repeater('tag in tags').row(0).column('tag.TagName')).click();

            var newCategory = element(by.id('tag_category')).element(by.css('option:checked')).getText();

            expect(newCategory).toEqual('Degree');

            done();
        })

        it('should be able to clear student feedback', function (done) {
            browser.get('index.html#!/sign-in');
            browser.waitForAngular();

            var email = element(by.id('email_input'));
            var Surname = element(by.id('pwd_input'));

            email.sendKeys('testuser');
            Surname.sendKeys('testpassword');

            element(by.id('sign_in_btn')).click();
            browser.waitForAngular();

            browser.get('index.html#!/feedback');
            browser.waitForAngular();

            var feedbackList = element.all(by.repeater('f in feedback'));

            expect(feedbackList.count()).toBe(4);

            element(by.buttonText('Clear Feedback')).click();

            var EC = protractor.ExpectedConditions;
            browser.wait(EC.alertIsPresent(), 5000, "Alert is not getting present")

            browser.switchTo().alert().accept();

            browser.waitForAngular();

            var feedbackList = element.all(by.repeater('f in feedback'));

            expect(feedbackList.count()).toBe(0);

            done();
        })

    })
})

describe('User Actions', function () {

    var connection;

    beforeEach(function (done) {

        db.getConnection(function (err, con) {
            if (err) {
                done(err);
            } else {
                connection = con;
                done();
            }
        });

    })

    afterEach(function (done) {
        if (connection) {
            connection.release();
            done()
        }
    })

    beforeAll(function () {
        browser.get('index.html#!/sign-in');
        browser.waitForAngular();

        var email = element(by.id('email_input'));
        var Surname = element(by.id('pwd_input'));

        email.sendKeys('tawil.hani@gmail.com');
        Surname.sendKeys('mcnwmcnw');

        element(by.id('sign_in_btn')).click();
        browser.waitForAngular();
    })

    it('should filter by Faculty Selection correctly', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Social Science & Public Policy')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(3);
    })

    it('should should page when clicking the next button', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();
        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        element(by.buttonText('Next')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(2);
    })

    it('shoudln\'t be able to press the next button again', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();
        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        element(by.buttonText('Next')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(2);

        element(by.buttonText('Next')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(2);
    })

    it('should be able to filter the module search space via search bar', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));
        var searchBar = element(by.model('$ctrl.queryName'));

        expect(moduleList.count()).toBe(5);

        searchBar.sendKeys('found');
        element(by.id('searchButton')).click();

        browser.waitForAngular();
        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(1);
    })

    it('should be able to filter the module search space via tags', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        element(by.buttonText('Internet')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(1);
    })

    it('should update the tags selection when the search space is filtered', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        var tagList = element.all(by.repeater('tag in $ctrl.categoryToTag.get($ctrl.tagCategories[0])'));

        expect(tagList.count()).toBe(3);

        element(by.buttonText('Internet')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(1);

        var tagList = element.all(by.repeater('tag in $ctrl.categoryToTag.get($ctrl.tagCategories[0])'));

        expect(tagList.count()).toBe(2);
    })

    it('should be able to filter the module search space via tags', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        element(by.buttonText('Internet')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(1);
    })

    it('should be able to filter the module search space via level', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        element(by.id('level6')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(1);
    })

    it('should be able to filter the module search space via credits', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        element.all(by.repeater('credit in $ctrl.allCredits').row(0).column('credit')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(2);
    })

    it('should be able to restrict options after filtering via credits', function () {
        browser.get('index.html#!/select-faculty');
        browser.waitForAngular();

        element(by.buttonText('Faculty of Natural & Mathematical Sciences')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(5);

        var tagList = element.all(by.repeater('tag in $ctrl.categoryToTag.get($ctrl.tagCategories[0])'));

        expect(tagList.count()).toBe(3);

        element.all(by.repeater('credit in $ctrl.allCredits').row(0).column('credit')).click();
        browser.waitForAngular();

        var moduleList = element.all(by.repeater('module in $ctrl.modules'));

        expect(moduleList.count()).toBe(2);

        var tagList = element.all(by.repeater('tag in $ctrl.categoryToTag.get($ctrl.tagCategories[0])'));

        expect(tagList.count()).toBe(1);
    })

    it('should be able to deactivate an account', function (done) {
        browser.get('index.html#!/sign-in');
        browser.waitForAngular();

        var email = element(by.id('email_input'));
        var Surname = element(by.id('pwd_input'));

        email.sendKeys('inconito@whoknows.org');
        Surname.sendKeys('password');

        element(by.id('sign_in_btn')).click();
        browser.waitForAngular();

        browser.get('index.html#!/deactivate-account');
        browser.waitForAngular();

        element(by.id('deactivate_btn')).click();
        browser.waitForAngular();

        var EC = protractor.ExpectedConditions;
        browser.wait(EC.alertIsPresent(), 5000, "Alert is not getting present")

        browser.switchTo().alert().accept();

        browser.waitForAngular();

        connection.query('select * from User where UserID = \'inconito@whoknows.org\'', function (err, rows) {
            try {
                expect(err).toEqual(null);
                expect(rows[0].UserID).toBe('inconito@whoknows.org');

            } catch (e) {
                done(e);
            }
        });

        done();
    })

})
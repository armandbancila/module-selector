var validator = require('validator');

var MODULEID = {
	in: 'body',
	notEmpty: true,
	isString:{},
	isLength:{
		options: [{max:30}],
		errorMessage: 'Invalid module ID: An ID can have at most 30 characters'
	},
	errorMessage: 'Invalid module ID: Only one ID must be given'
};


exports.isNotArray = function(value) {
	return !Array.isArray(value);
};

exports.isString = function(val){return typeof val === 'string';};

exports.onlyWeekdays = function(value){
	if(Array.isArray(value)) return value.every((val)=>{return validator.matches(val, '^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$', 'i');});
	else return validator.matches(value, '^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$', 'i');
}

exports.onlyInts = function(value){
	if(Array.isArray(value)) return value.every((val)=>{return validator.isInt(val);});
	else return validator.isInt(value);
}


exports.isStringArray = function(value){
	if(Array.isArray(value)) return value.every((val)=>{return typeof val === 'string';});
	else return false;
}

exports.STRING_OPTIONS = {customValidators:{isString: exports.isString, isStringArray: exports.isStringArray}};

exports.FILTER_SCHEMA = {
 'module_name': {
	 	in: 'query',
		optional: true,
	 	isNotArray: {},
	  errorMessage: 'Invalid module name component: Can only match one string at a time'
  },
  'credits': {
		in: 'query',
    optional: true,
		isInt: {
				options: [{ min: 0}]
		},
    errorMessage: 'Invalid credit count: Must be a positive integer'
  },
  'day': {
		in: 'query',
    optional: true,
    onlyWeekdays: {},
    errorMessage: 'Invalid day/s'
	},
	'year': {
		in: 'query',
    optional: true,
    isInt: {
      options: [{min:0, max:9}]
    },
		errorMessage: 'Invalid module level: Must be single digit'
  },
  'time_range': {
		in: 'query',
    optional: true,
		isNotArray:{},
    matches: { 
      options: ['^((([01]{1}[0-9]{1})|([2]{1}[0-3]{1}))([0-5]{1}[0-9]{1}){2}[:]{1}(([01]{1}[0-9]{1})|([2]{1}[0-3]{1}))([0-5]{1}[0-9]{1}){2})$', 'i'],
			errorMessage: 'Invalid range: Must be in format hhmmss:hhmmss'
    }, 
    errorMessage: 'Invalid range: Can only match one range at a time'
  },
	'faculty': { 
		in: 'query',
    optional: true,
		isNotArray: {},
    errorMessage: 'Invalid faculty: Can only match one string at a time'
	},
	'coursework_percentage': {
		in: 'query',
    optional: true,
    isInt: {
      options: [{ min: 0, max:100}]
    },
    errorMessage: 'Invalid coursework percentage'
	},
	'per_page': { 
		in: 'query',
    optional: true,
    isInt: {
      options: [{ min: 0}]
    },
    errorMessage: 'Invalid per page count: Must be a positive integer'
	},
	'page': { 
		in: 'query',
    optional: true,
    isInt: {
      options: [{ min: 0}]
    },
    errorMessage: 'Invalid page number: Must be a positive integer'
	}
	
};

exports.FILTER_VALIDATOR_OPTIONS = {customValidators:{isNotArray: exports.isNotArray, onlyWeekdays: exports.onlyWeekdays}};

exports.MODULE_SCHEMA = {
	'moduleID': MODULEID,
	'moduleName': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid module name: A module name can have at most 100 characters'
		},
    errorMessage: 'Invalid module name: Only one name must be given'
	},
	'description': {
		in: 'body',
    notEmpty: true,
		isNotArray:{},
		isLength:{
			options: [{max:60000}],
			errorMessage: 'Invalid description: A module description can have at most 60000 characters'
		},
    errorMessage: 'Invalid description: Only one description must be given'
  },
	'year': {
		in: 'body',
    notEmpty: true,
    isInt: {
      options: [{min:0, max:9}]
    },
		errorMessage: 'Invalid module level: Must be single digit'
  },
  'credits': {
		in: 'body',
    notEmpty: true,
		isInt: {
				options: [{ min: 0}]
		},
    errorMessage: 'Invalid credit count: Must be a single positive integer'
  },
	'lectureDay':{
		in: 'body',
		notEmpty: true,
		isString: {},
		isLength:{
			options: [{max: 10}],
			errorMessage: 'Invalid day: A module day can have at most 10 characters'
		},
		onlyWeekdays:{errorMessage: 'Invalid day: Must be a valid day of the week'},
		errorMessage: 'Invalid day: Only one lecture day must be given'
	},
	'lectureTime':{
		in: 'body',
		notEmpty: true,
		isString: {},
		matches: { 
      options: ['^((([01]{1}[0-9]{1})|([2]{1}[0-3]{1}))([:]?[0-5]{1}[0-9]{1}){2})$', 'i'],
			errorMessage: 'Invalid time: Must be in format hh:mm:ss or hhmmss'
    }, 
		errorMessage: 'Invalid time: A single valid lecture time string must be given'
	},
	'courseworkPercentage': {
		in: 'body',
    notEmpty: true,
    isInt: {
      options: [{ min: 0, max:100}]
    },
    errorMessage: 'Invalid coursework percentage'
	},
  'faculty': { 
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid faculty name: A faculty name can have at most 100 characters'
		},
    errorMessage: 'Invalid faculty: Only one faculty must be given'
	}
};

exports.MODULE_VALIDATOR_OPTIONS = {customValidators:{isString: exports.isString, onlyWeekdays: exports.onlyWeekdays}};

exports.TRACKING_SCHEMA = {
	'moduleID': MODULEID,
	'userID': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid user ID: A user ID can have at most 100 characters'
		},
    errorMessage: 'Invalid user ID: A single ID must be given'
	},
	'tagArray': {
		in: 'body',
    optional: true,
		isStringArray:{},
		errorMessage: 'Invalid tag array: Array must only contain strings'
  }
};

exports.TRACKING_VALIDATOR_OPTIONS = {customValidators:{isString: exports.isString, isStringArray: exports.isStringArray}};


exports.RECOMMENDATION_SCHEMA = {
	'wanted': {
		in: 'query',
		optional: true,
		isInt:{
			options: [{min:0}],
		},
	  errorMessage: 'Invalid wanted count: Must be positive integer'
  }
};


exports.FEEDBACK_SCHEMA = {
	'usefulness': {
		in: 'body',
		notEmpty: true,
		isInt:{
			options: [{min:0, max:5}],
			errorMessage: 'Invalid usefulness rating: Rating from 0 to 5 must be given'
		},
	  errorMessage: 'Invalid usefullness rating: Rating must be given'
  },
	'usability':  {
		in: 'body',
		notEmpty: true,
		isInt:{
			options: [{min:0, max:5}],
			errorMessage: 'Invalid usability rating: Rating from 0 to 5 must be given'
		},
	  errorMessage: 'Invalid usability rating: Rating must be given'
  },
	'informative':  {
		in: 'body',
		notEmpty: true,
		isInt:{
			options: [{min:0, max:5}],
			errorMessage: 'Invalid informative rating: Rating from 0 to 5 must be given'
		},
	  errorMessage: 'Invalid informative rating: Rating must be given'
  },
	'security':  {
		in: 'body',
		notEmpty: true,
		isInt:{
			options: [{min:0, max:5}],
			errorMessage: 'Invalid security rating: Rating from 0 to 5 must be given'
		},
	  errorMessage: 'Invalid security rating: Rating must be given'
  },
	'accessibility':  {
		in: 'body',
		notEmpty: true,
		isInt:{
			options: [{min:0, max:5}],
			errorMessage: 'Invalid accessibility rating: Rating from 0 to 5 must be given'
		},
	  errorMessage: 'Invalid accessibility rating: Rating must be given'
  },
	'reasons':  {
		in: 'body',
		isString:{},
		isLength:{
			options: [{min:0, max:60000}],
			errorMessage: 'Invalid reason string: Reason string can be at most 60000 characters'
		},
	 	errorMessage: 'Invalid reason string: Reason string must be provided, even if empty'
  },
	'comments':  {
		in: 'body',
		isString:{},
		isLength:{
			options: [{min:0, max:60000}],
			errorMessage: 'Invalid comment string: Comment string can be at most 60000 characters'
		},
	 	errorMessage: 'Invalid comment string: Comment string must be provided, even if empty'
  }
};

exports.FEEDBACK_VALIDATOR_OPTIONS = {customValidators: {isString: exports.isString}};


exports.DATE_SCHEMA = {
	'before_date': {
		in: 'query',
		optional: true,
		matches: { 
      options: ['^(([0-9]{4})[\-]{1}(([0]{1}[1-9]{1})|[1]{1}[0-2]{1}){1}[\-]{1}(([0]{1}[1-9]{1})|([12]{1}[0-9]{1})|([3]{1}[01]{1})))$', 'i'],
    },
	  errorMessage: 'Invalid date: Must be in format YYYY-MM-DD'
  }
};

exports.GROUP_SCHEMA = {
	'access_group': {
		in: 'query',
		optional: true,
		onlyInts: {},
	  errorMessage: 'Invalid groups: Must be integers'
  }
};

exports.PARAMS_GROUP_SCHEMA = {
	'accessGroup': {
		in: 'params',
		isInt:{
			options: [{}],
		},
	  errorMessage: 'Invalid group: Must be integer'
  }
};

exports.GROUP_OPTIONS = {customValidators: { onlyInts: exports.onlyInts}};

exports.USER_SCHEMA = {
	'userID': {
		in: 'body',
		notEmpty: true,
	 	isEmail: {errorMessage: 'Invalid user ID: An ID must be a valid E-Mail address'},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid user ID: An ID can have at most 100 characters'
		},
	  errorMessage: 'Invalid user ID: A valid e-mail address must be given'
  },
	'fName': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:50}],
			errorMessage: 'Invalid first name: A first name can have at most 50 characters'
		},
    errorMessage: 'Invalid first name: A valid name must be given'
	},
	'lName': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:50}],
			errorMessage: 'Invalid last name: A last name can have at most 50 characters'
		},
    errorMessage: 'Invalid last name: A valid name must be given'
	},
	'password': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isAscii:{errorMessage: 'Invalid password: A password can only consist of ASCII characters'},
		isLength:{
			options: [{max:50}],
			errorMessage: 'Invalid password: A password can have at most 50 characters'
		},
    errorMessage: 'Invalid password: A valid password must be given'
	}
};

exports.USER_UPDATE_SCHEMA = {
	'userID': {
		in: 'body',
		notEmpty: true,
	 	isEmail: {errorMessage: 'Invalid user ID: An ID must be a valid E-Mail address'},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid user ID: An ID can have at most 100 characters'
		},
	  errorMessage: 'Invalid user ID: A valid e-mail address must be given'
  },
	'fName': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:50}],
			errorMessage: 'Invalid first name: A first name can have at most 50 characters'
		},
    errorMessage: 'Invalid first name: A valid name must be given'
	},
	'lName': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:50}],
			errorMessage: 'Invalid last name: A last name can have at most 50 characters'
		},
    errorMessage: 'Invalid last name: A valid name must be given'
	}
};


exports.USER_OPTIONS = {customValidators:{isString: exports.isString}};

exports.TAG_SCHEMA = {
	'tagName': {
		in: 'body',
		notEmpty: true,
		isLength:{
			options: [{max:50}],
			errorMessage: 'Invalid tag name: A tag name can have at most 50 characters'
		},
	  errorMessage: 'Invalid tag name: A valid tag name must be given'
  },
	'category': {
		in: 'body',
		optional:true,
     	notEmpty: true,
		isLength:{
			options: [{max:50}],
			errorMessage: 'Invalid category: A category can have at most 50 characters'
		},
    errorMessage: 'Invalid category: A provided category must be A non-empty string'
	}
};


exports.DEGREE_SCHEMA = {
	'degreeTitle': {
		in: 'body',
		notEmpty: true,
		isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid degree title: A title can have at most 100 characters'
		},
	  errorMessage: 'Invalid degree title: A valid title must be given'
  },
	'lengthOfStudy': {
		in: 'body',
    notEmpty: true,
		isInt:{
			options: [{min:1}],
			errorMessage: 'Invalid length of study: A degree must have at least one year of study'
		},
    errorMessage: 'Invalid length of study: A valid length of study must be given'
	}
};

exports.DEGREE_OPTIONS = {customValidators:{isString: exports.isString}};


exports.MODULE_ASSIGNMENT_SCHEMA = {
	'moduleID': MODULEID,
	'isOptional': {
		in: 'body',
    notEmpty: true,
		isBoolean: true,
    errorMessage: 'Invalid optional setting: A valid boolean must be given'
	},
	'dependentIDArray':{
		optional: true,
		isStringArray:{}
	},
	'recommendedIDArray':{
		optional: true,
		isStringArray:{}
	}
};

exports.MODULE_ASSIGNMENT_UPDATE_SCHEMA = {
	'isOptional': {
		in: 'body',
    notEmpty: true,
		isBoolean: true,
    errorMessage: 'Invalid optional setting: A valid boolean must be given'
	}
}

exports.ASSIGNMENT_OPTIONS = {customValidators:{isString: exports.isString, isStringArray: exports.isStringArray}};

exports.DEPENDENCY_SCHEMA = {
	'moduleID' : MODULEID,
	'dependentID': MODULEID	
}

exports.DEPENDENCY_UPDATE_SCHEMA = {
	'dependentIDArray':{
		optional: true,
		isStringArray:{}
	},	
}

exports.RECOMMENDED_SCHEMA = {
	'moduleID' : MODULEID,
	'recommendedID': MODULEID	
}
exports.RECOMMENDED_UPDATE_SCHEMA = {
	'recommendedIDArray':{
		optional: true,
		isStringArray:{}
	}
}

exports.BUILD_SCHEMA = {
	'degreeTitle': {
		in: 'body',
		notEmpty: true,
		isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid degree title: A title can have at most 100 characters'
		},
	  errorMessage: 'Invalid degree title: A valid title must be given'
  },
	'userID': {
		in: 'body',
		notEmpty: true,
		isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid user ID: An ID can have at most 100 characters'
		},
	  errorMessage: 'Invalid user ID: A valid e-mail address must be given'
  }
}

exports.TEMPLATE_SCHEMA = {
	'template': {
		in: 'query',
		optional: true,
		notEmpty: true,
		isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid degree title: A title can have at most 100 characters'
		},
	  errorMessage: 'Invalid degree title: A valid title must be given'
  }
	
}

exports.MODULEID_SCHEMA = {
	'moduleID' : MODULEID	
}

exports.USERID_SCHEMA ={
	'userID': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid user ID: A user ID can have at most 100 characters'
		}
	}
}

exports.USERID_EMAIL_SCHEMA ={
	'userID': {
		in: 'body',
    notEmpty: true,
    isEmail:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid user ID: A user ID can have at most 100 characters'
		}
	}
}

exports.PASSWORD_SCHEMA = {
	'password': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isAscii:{errorMessage: 'Invalid password: A password can only consist of ASCII characters'},
		isLength:{
			options: [{max:50}],
			errorMessage: 'Invalid password: A password can have at most 50 characters'
		},
    errorMessage: 'Invalid password: A valid password must be given'
	}
}

exports.ACCESS_RESET_SCHEMA ={
	'userID': {
		in: 'body',
    notEmpty: true,
    isString:{},
		isLength:{
			options: [{max:100}],
			errorMessage: 'Invalid user ID: A user ID can have at most 100 characters'
		}
	},
	'accessGroup': {
		in: 'body',
		notEmpty: true,
		isInt:{
			options: [{}],
		},
		errorMessage: 'Invalid groups: Must be integers'
 	}
}
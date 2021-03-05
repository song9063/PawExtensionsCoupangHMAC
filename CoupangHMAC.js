// HMAC Generator for Coupang API
// https://github.com/song9063/PawExtensionsCoupangHMAC
// Coupang API: https://developers.coupangcorp.com/


var CoupangHMAC = function(){
	this.getEnvValueByName = function(context, name){
		var envVar = context.getEnvironmentVariableByName(name);
		return envVar.getCurrentValue(false);
	}
	this.evaluate = function(context){
		var CLIENT_KEY = this.getEnvValueByName(context,'CLIENT_KEY');	
		var SECRET_KEY = this.getEnvValueByName(context,'SECRET_KEY');
		var AUTH_TYPE = 'CEA algorithm=HmacSHA256';
		var timestamp = new Date().toISOString().split('.')[0]+"Z";
		timestamp = timestamp.replace(/:/gi, "").replace(/-/gi, "").substring(2);
	
		var request = context.getCurrentRequest();
		var method = request.method;
		var urlBase = this.getPath(request.urlBase);
		var urlQuery = request.urlQuery;
		var message = '' + timestamp + method + urlBase + urlQuery;
		message = this.replaceVariables(message);
		
		// crypto-js 3.3.0 https://www.cdnpkg.com/crypto-js/file/crypto-js.min.js/
        var CryptoJS = require('crypto-js.min.js');
		var hash = CryptoJS.HmacSHA256(message, SECRET_KEY);
		var hmacDigest = CryptoJS.enc.Hex.stringify(hash);
		var authHeader = AUTH_TYPE + ", access-key=" + CLIENT_KEY + ', signed-date=' + timestamp + ', signature=' + hmacDigest;
		
		return authHeader;
	}
	this.getPath = function(url){
		var pathRegex = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
          var result = url.match(pathRegex);
          return result && result.length > 1 ? result[1] : '';
	}
	this.replaceVariables = function(templateString) {
		// https://underscorejs.org
		var under = require('underscore-min.js');
		let tokens = under.uniq(templateString.match(/{{\w*}}/g))

		under.forEach(tokens, t => {
			let variable = t.replace(/[{}]/g, '')
			let value = environment[variable] || globals[variable]
			templateString = templateString.replace(new RegExp(t,'g'), value)
		});

		return templateString;
	}
	this.title = function(context){
		return "CoupangHMAC";
	}
	this.text = function(context){
		return "Fill your API keys in the environments";
	}
}
CoupangHMAC.identifier = "com.busanginc.PawExtensions.CoupangHMAC";
CoupangHMAC.title = "Coupang HMAC";
CoupangHMAC.help = "https://github.com/song9063/PawExtensionsCoupangHMAC";
registerDynamicValueClass(CoupangHMAC);
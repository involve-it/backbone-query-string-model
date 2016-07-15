import Backbone from 'backbone'; // just to show dependency #1, can be global
import BackboneHistory from 'backbone.history'; // just to show dependency #2, can be global
import R from 'rambda'; // same. It can be removed or replaced with Underscore easily

var viewPattern = /__/;


export default class QueryStringModel extends Backbone.Model.extend({
        initialize : function(silently = false, qsNames = []){
            var that = this;
            if (Array.isArray(silently)) {
                qsNames = silently;
                silently = false;
            }
            this.silently = silently;
            this.qsNames = qsNames;
            // update model values, based on the current query string each time url is changed
            this.listenTo(Backbone.history, 'jnRoute', function(attr){
                let prevUrl = Backbone.history.jnPrevious() && Backbone.history.jnPrevious().fragment
                var qsObject = getQueryStringAsObject({  whiteList: this.qsNames }); // we'll use this to prove that model wasn't changed from qs
                var qsObjectPrev = getQueryStringAsObject({
                    whiteList: this.qsNames,
                    url: prevUrl
                });
                if (!_.isEmpty(qsObject) || !_.isEmpty(qsObjectPrev)) {


                    _.each(qsObjectPrev, function(value, key) {
                     if (!qsObject[key]) {
                     qsObject[key] = undefined;
                     }
                     })
                    _.each(qsObject, function (value, name) {
                        if (qsObject[name] !== that.get(name)) {
                            that.set(name, value);
                        }
                    });
                }
            });
            this.listenTo(this, 'change', function (attr) {
                var qsObject = getQueryStringAsObject({
                    whiteList: this.qsNames
                }); // we'll use this to prove that model wasn't changed from qs
                var attrCid = $.extend(true, {}, attr.changed);
                var cid = this.controlId;
                if (!_.isEmpty(attrCid)) {
                    _.each(attrCid, function(value, name){
                        if(!viewPattern.test(name) && (_.isUndefined(qsObject[name]) || qsObject[name] !== value)) { // don't take control qs!
                            var qs1 = {};
                            qs1[name] = value;
                            addUpdateQueryParameters(qs1, true);
                            // addUpdateQueryParameters(qs1, that.silently);
                        }
                    });
                }
            });
            // initial fill:
            var qsObject = getQueryStringAsObject({
                whiteList: this.qsNames
            });
            //set initially
            _.each(qsObject, function(value, name){
                if (qsObject[name] !== that.get(name)){
                    that.set(name, value);
                    // that.set(name, value, { silent: true });
                }
            });
        },
        destroy : function(){
            this.off();
            this.stopListening();
        },
        close : function() {  // custom, for cleaning things:
            this.clear();
        }
}) {}

function getQueryStringAsObject(options = {}) {
    var ret = {}, qsObject;
    let url = options.url || window.document.location.href;
    qsObject = QueryStringToJSON(getQueryString(url.trim('#')));
    // options: if controlId is defined, return
    if(options.bare) { // get only 'bare' query params:
        options.barePattern = options.barePattern || /Control__/;
        _.each(qsObject, function(i,k, obj) {
            if(!options.barePattern.test(k)) {
                ret[k] = i;
            } else {}
        });
    } else if (options.controlId) {// get only control-specific query params:
        options.controlPattern = options.controlPattern || new RegExp(options.controlId + '__');
        _.each(qsObject, function (i, k, obj) {
            if (!options.controlPattern.test(k)) {
            } else {
                k = k.split('__')[1];
                ret[k] = i;
            }
        });
    } else if (options.whiteList && !!options.whiteList.length) {
        const filterWithKeys = (pred, obj) => R.pipe(
            R.toPairs,
            R.filter(R.apply(pred)),
            R.fromPairs
        )(obj);

        ret = filterWithKeys(
            (key, val) => R.contains(key, options.whiteList),
            qsObject
        );
    } else {
        ret = qsObject;
    }
    return ret;
};

function QueryStringToJSON (url) {
    var ret = '';
    try {
        if (url) {
            var pairs = url.split('&');
            var result = {};
            pairs.forEach(function(pair) {
                if (pair !== '') {
                    var pairKey = pair.substring(0,pair.indexOf('='));
                    var pairValue = pair.substring(pair.indexOf('=')+1);
                    //pair = pair.split('=');
                    result[decodeURIComponent(pairKey)] = decodeURIComponent(pairValue || '');
                }
            });
            ret = JSON.parse(JSON.stringify(result));
        }
    } catch (e) {
    }
    if (ret==''){
        ret = {}
    }
    return ret;
}

 function getQueryString (url) {
    var ret = '';
     url = url || window.document.location.href || '';
     ret = url.lastIndexOf('?') !== -1 ? url.substr(url.lastIndexOf('?') + 1) : '';

    return ret;
}

function addUpdateQueryParameters (queryObject, silent) {
    try {
        var qsObject = QueryStringToJSON(getQueryString());
        _.each(queryObject, function(i, item) {
            if (typeof queryObject[item] === 'undefined' || queryObject[item] === '' || queryObject[item] === null) {
                if (typeof qsObject[item] !== 'undefined') {
                    qsObject[item] = null;
                    delete qsObject[item];
                }
            } else {
                qsObject[item] = queryObject[item];
            }
        });
        var qsString = $.param(qsObject),
            nonQsPath = document.location.pathname + document.location.hash.substr(0, document.location.hash.indexOf('?'));
        if (silent === true) {
            Backbone.history.navigate(nonQsPath + '?' + qsString, { silent : true, callback : false });
        } else {
            Backbone.history.navigate(nonQsPath + '?' + qsString, { trigger: true });
        }
    } catch (ex) {
        throw  ex;
    }
};

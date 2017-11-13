module.exports = function() {
  return{
      link: function (scope,element,attrs,controller){
          element.on('click', function(event){
              scope.websites.splice(scope.websites.indexOf(scope.website), 1);
              console.log(scope.websites);
              //remove visits and min from totals
              //scope.model.totalVisits -= scope.website.websiteVisits;
              scope.model.totalVisits = 0;
              scope.model.totalTime = 0;
              if(scope.websites.length >10){
                for(var i = 0; i < 10; i++){
                    scope.model.totalVisits += scope.websites[i].websiteVisits;
                    scope.model.totalTime += scope.websites[i].formatedTime.min+(scope.websites[i].formatedTime.hours*60)+((scope.websites[i].formatedTime.days*24)*60);
                }
              }else{
                for(var i = 0; i < scope.websites.length; i++){
                    scope.model.totalVisits += scope.websites[i].websiteVisits;
                    scope.model.totalTime += scope.websites[i].formatedTime.min+(scope.websites[i].formatedTime.hours*60)+((scope.websites[i].formatedTime.days*24)*60);
                }
              }

              //todo move to background as totalmin
              //scope.model.totalTime -= scope.website.formatedTime.min+(scope.website.formatedTime.hours*60)+((scope.website.formatedTime.days*24)*60);
              _gaq.push(['_trackEvent', scope.website.websiteName, 'websiteRemoved']);
              chrome.runtime.sendMessage({
                  action: "remove",
                  list: scope.websites
              });
          });
      }
  }
};

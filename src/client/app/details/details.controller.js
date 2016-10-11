(function() {
  'use strict';

  angular
    .module('app.details')
    .controller('DetailsController', DetailsController);

  DetailsController.$inject = ['$q', 'logger', '$stateParams','dataservice','$location'];
  /* @ngInject */
  function DetailsController($q, logger, $stateParams, dataservice,$location) {
    var vm = this;
    vm.title = 'Details';
    vm.data = {};
    vm.id = $stateParams.id;
    vm.like = 'like';
    vm.dislike = 'dislike';
    vm.showThanks = false;
    vm.personPhrase = 'person likes this';
    vm.peoplePhrase = 'people like this';
    vm.myUrl = $location.absUrl();
    vm.dummyResources =  "<h2>Resources</h2><p>Genital Herpes - CDC Fact Sheet<br>National Center for HIV/AIDS, Viral Hepatitis, STD, and TB Prevention, Division of STD Prevention<br><a href=\"http://www.cdc.gov/std/Herpes/STDFact-Herpes.htm\">http://www.cdc.gov/std/Herpes/STDFact-Herpes.htm</a></p><p>Genital Herpes<br>National Center for HIV/AIDS, Viral Hepatitis, STD, and TB Prevention, Division of STD Prevention<br><a href=\"http://www.cdc.gov/std/Herpes/default.htm\">http://www.cdc.gov/std/Herpes/default.htm</a></p><p>Condom Fact Sheet In Brief<br>National Center for HIV/AIDS, Viral Hepatitis, STD, and TB Prevention<br><a href=\"http://www.cdc.gov/condomeffectiveness/brief.html\">http://www.cdc.gov/condomeffectiveness/brief.html</a></p><p>Sexually Transmitted Diseases (STDs)<br>National Center for HIV/AIDS, Viral Hepatitis, STD, and TB Prevention, Division of STD Prevention<br><a href=\"http://www.cdc.gov/std/\">http://www.cdc.gov/std/</a></p><h2>Publications</h2><p>CDC Fact Sheet: Genital Herpes<br>National Center for HIV/AIDS, Viral Hepatitis, STD, and TB Prevention, Division of STD Prevention<br><a href=\"http://www.cdc.gov/std/herpes/herpes-factsheet-july-2014.pdf\">http://www.cdc.gov/std/herpes/herpes-factsheet-july-2014.pdf</a><br>Publication ID 127497</p><p>Condom Fact Sheet In Brief<br>National Center for HIV/AIDS, Viral Hepatitis, STD, and TB Prevention<br><a href=\"http://www.cdc.gov/condomeffectiveness/brief.htmlCondom_fact_Sheet_in_Brief.pdf\">http://www.cdc.gov/condomeffectiveness/brief.htmlCondom_fact_Sheet_in_Brief.pdf</a><br>Publication ID 127498</p>";
    vm.dummyRelated = "5252,1548,2658";

    vm.ratePreparedResponse = function(type) {
      return dataservice.ratePreparedResponse(type, vm.id).then(function(response){
        if(response.status === 200) {
          vm.showThanks = true;
        }
        console.log(response);
      });
    };

   vm.printPage = function() {
      //console.log(section1.innerHTML);
      var WindowObject = window.open("", "PrintWindow",
        "width=750,height=650,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes");
      WindowObject.document.open();
      WindowObject.document.write('<html><head><style>@media print {h2 {font-size: 15pt;} p { font-size: 9pt;} .content-section {font-size: 10pt; page-break-after: avoid;} .related-links {font-size: 10pt;} }</style></head>');
     //WindowObject.document.write("<link rel='stylesheet' href='/.tmp/custom.css'>");
     //WindowObject.document.writeln(printSection.innerHTML);
      WindowObject.document.writeln(section1.innerHTML);
      WindowObject.document.writeln('');
      WindowObject.document.writeln(section2.innerHTML);
      WindowObject.document.writeln('');
      WindowObject.document.writeln(section3.innerHTML);
      WindowObject.document.writeln('');
      WindowObject.document.writeln(section4.innerHTML);
      WindowObject.document.writeln('');
      WindowObject.document.writeln(section5.innerHTML);
      WindowObject.document.writeln('');
      WindowObject.document.writeln(section6.innerHTML);
      WindowObject.document.writeln('');
      WindowObject.document.write('</html>');
      WindowObject.document.close();
      WindowObject.focus();
      WindowObject.print();
      WindowObject.close();
    }

    activate();
    // console.log(vm.data);

    function activate() {
      var promises = [getPreparedResponse(vm.id)];
      return $q.all(promises).then(function() {
        // logger.info('Activated Details View');
        vm.mailtoStr = "mailto:?Subject=I thought you may like this: "+vm.data.title+"&body="+vm.data.title+"%0A"+vm.myUrl;
      });
    }

    function getPreparedResponse(id) {
      if (id !== null){
        return dataservice.getPreparedResponsebyId(id).then(function(data) {
          vm.data = data; // not sure why we need to do this;
          vm.data = vm.data._source;
          vm.data.relatedPR = data.relatedPR;
          vm.data.resources = data.resources || vm.dummyResources;
          return vm.data;
        });
      }
    }

    vm.shareTwitter = function(url, text) {
      open('http://twitter.com/share?url=' + url + '&text=' + text, 'tshare', 'height=400,width=550,resizable=1,toolbar=0,menubar=0,status=0,location=0');
    }

    vm.shareFacebook = function(url,text) {
      var url = 'https://my.website.com/detail/'+vm.data.id;
      var text = vm.data.title;
      open('https://facebook.com/sharer.php?s=100&p[url]=' + url, 'fbshare', 'height=380,width=660,resizable=0,toolbar=0,menubar=0,status=0,location=0,scrollbars=0');
    }

  }
})();

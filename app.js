function application(){
}

application.prototype.displayCurrentUser = function (selector) {
    BX24.callMethod(
        'user.current',
        {},
        function (result) {
            $(selector).html('Hello ' + result.data().NAME + ' ' + result.data().LAST_NAME + '!'); 
        }
    );
};


application.prototype.displayDealList = function() {
    BX24.callMethod(
        'crm.deal.list',
        {
            order: {"STAGE_ID" : "ASC"},
            // filter: {"ASSIGNED_BY_ID": 3},
            select: ["ID", "TITLE", "STAGE_ID", 'OPPORTUNITY']
        },
        function(result)
        {
            if(result.error()){
                console.error(result.error());
            } else {
                var data  = result.data();
                var dealHTML = "", dealSum = 0;
                for (indexDeal in data){
                    dealSum += parseFloat(data[indexDeal].OPPORTUNITY);
                    dealHTML += '<tr><th scope="row">' + data[indexDeal].ID + '</th><td>' + data[indexDeal].TITLE + '</td>'
                        + '<td>'+data[indexDeal].OPPORTUNITY+'</td></tr>';
                }


                if(result.more()){
                    result.next();
                }else{
                    $("#dealList").html(dealHTML);
                    $("#dealSum").html('<span class="volume">' + dealSum + '</span><br>общая сумма');
                }

            }
        }
    );
};


application.prototype.saveFrameWidth  = function() {
  this.FrameWidth = document.getElementById("app").offsetWidth;
};



app = new application();


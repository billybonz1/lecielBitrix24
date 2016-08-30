function application(){
}

application.prototype.displayCurrentUser = function (selector) {
    BX24.callMethod(
        'user.current',
        {},
        function (result) {
            $(selector).html(result.data().NAME + ' ' + result.data().LAST_NAME);
            $(selector + "--first-letter").html(result.data().NAME[0]);
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
                    dealHTML += '<tr><th scope="row">' + data[indexDeal].ID + '</th><td class="mdl-data-table__cell--non-numeric">' + data[indexDeal].TITLE + '</td>'
                        + '<td class="mdl-data-table__cell--non-numeric">'+data[indexDeal].OPPORTUNITY+'</td></tr>';
                }


                if(result.more()){
                    result.next();
                }else{
                    $("#dealList").html(dealHTML);
                    $("#dealSum").html(dealSum);
                }

            }
        }
    );
};


application.prototype.displayDealersList = function(){
    BX24.callMethod(
        "crm.contact.list",
        {
            order: { "DATE_CREATE": "ASC" },
            filter: { "TYPE_ID": 'SUPPLIER' }
        },
        function(result)
        {
            if(result.error())
                console.error(result.error());
            else
            {
                console.dir(result.data());
                if(result.more())
                    result.next();
            }
        }
    );

    BX24.callMethod(
        "crm.status.entity.types",
        {},
        function(result)
        {
            if(result.error())
                console.error(result.error());
            else
                console.dir(result.data());
        }
    );

};



application.prototype.resizeFrame = function(){
    var currentSize  = BX24.getScrollSize();
    var minHeight = currentSize.scrollHeight;
    if(minHeight < 400) minHeight = 400;
    BX24.resizeWindow(this.FrameWidth, minHeight);
};


application.prototype.saveFrameWidth  = function() {
    this.FrameWidth = document.getElementById("app").offsetWidth;
};



application.prototype.prepareEnity = function(arEntityDesc) {
    var batch = [];

    batch.push(['entity.add', {'ENTITY': arEntityDesc.NAME, 'NAME': arEntityDesc.DESC, 'ACCESS': {AU: 'W'}}]);
};





// Создание хранилища цен для каждой позиции отдельного дилера
application.prototype.addDealersPriceEntity = function(){
    var arDealersPriceEntity  = {
        NAME: "dealers_price",
        DESC: 'Dealers Price Data',
        PROPERTIES: [
            {CODE: 'ID_POST', NAME: 'ID позиции', TYPE: 'N'},
            {CODE: 'PRICE', NAME: 'Цена позиции', TYPE: 'N'},
            {CODE: 'ID_DEALER', NAME: 'ID дилера', TYPE: 'N'}
        ]
    };
};

app = new application();


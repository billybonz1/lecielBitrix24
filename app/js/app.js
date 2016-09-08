function application(){
}
application.prototype.isDataLoaded = function(){
    for(keyIndex in this.appLoadedKeys)
        if (this.appLoadedKeys[keyIndex].loaded !== true) return;
    this.processUserInterface();
};

application.prototype.addLoadedKey = function(aKey){
    this.appLoadedKeys[aKey] = {
        loaded: false
    };
};


application.prototype.displayCurrentUser = function () {
    this.appLoadedKeys = [];
    var curapp = this;
    curapp.addLoadedKey('current-user');
    curapp.addLoadedKey('dealers-list');
    BX24.callMethod(
        'user.current',
        {},
        function (result) {
            curapp.currentUser = result.data().NAME + ' ' + result.data().LAST_NAME;
            curapp.appLoadedKeys['current-user'].loaded = true;
            curapp.isDataLoaded();
        }
    );
};



application.prototype.displayDealersList = function(){
//Выводим список дилеров и их долгов на первом экране
    var curapp = this;
    curapp.arDealerList = [];
    curapp.dealersHTML = "";
    BX24.callMethod('entity.item.get', {
            ENTITY: "info",
            SORT: {DATE_ACTIVE_FROM: 'ASC'}
        },

        function (result) {
            if(result.error()){
                console.error(result.error());
            }else{
                var DEALERS_CONTACT_TYPE = result.data()[0].PROPERTY_VALUES.DEALER_CONTACT_TYPE;
                BX24.callMethod(
                    "crm.contact.list",
                    {
                        order: { "DATE_CREATE": "ASC" },
                        filter: { "TYPE_ID": DEALERS_CONTACT_TYPE },
                        select: [ "ID", "NAME", "LAST_NAME", "TYPE_ID", "SOURCE_ID" ]
                    },
                    function(result)
                    {
                        if(result.error()){
                            console.error(result.error());
                        } else {
                            curapp.arDealerList = curapp.arDealerList.concat(result.data());

                            if(result.more()){
                                result.next();
                            }else{
                                curapp.appLoadedKeys['dealers-list'].loaded = true;
                                curapp.currentDealerDealList(0);
                            }

                        }
                    }
                );
            }
        }
    );
};



application.prototype.currentDealerDealList = function(i){
    var curapp = this;
    curapp.DEBT_SUM = 0;
    console.log(curapp.arDealerList);
    BX24.callMethod(
        "crm.deal.list",
        {
            order: { "STAGE_ID": "ASC" },
            filter: { "CONTACT_ID": curapp.arDealerList[i].ID},
            select: [ "OPPORTUNITY", "CURRENCY_ID", "STAGE_ID"]
        },
        function(result)
        {
            curapp.DEBT_SUM = 0;
            if(result.error())
                console.error(result.error());
            else
            {
                var dataDeal = result.data();
                for (indexDeal in dataDeal){
                    if(dataDeal[indexDeal].STAGE_ID != "WON"){
                        curapp.DEBT_SUM += parseFloat(dataDeal[indexDeal].OPPORTUNITY);
                    }
                }
                if(result.more()){
                    result.next();
                }else{
                    var rowClass = "";
                    if(curapp.DEBT_SUM == 0){
                        rowClass = 'row-green';
                    }else if(curapp.DEBT_SUM <= 2000){
                        rowClass = 'row-yellow';
                    }else if(curapp.DEBT_SUM > 2000 && curapp.DEBT_SUM <= 8000){
                        rowClass = 'row-orange';
                    }else if(curapp.DEBT_SUM > 8000){
                        rowClass = 'row-red';
                    }
                    curapp.dealersHTML += '<tr class="'+rowClass+'"><th scope="row">' + curapp.arDealerList[i].ID + '</th><td class="mdl-data-table__cell--non-numeric">' + curapp.arDealerList[i].NAME + " " + curapp.arDealerList[i].LAST_NAME + '</td>'
                        + '<td class="mdl-data-table__cell--non-numeric">'+curapp.DEBT_SUM+'</td></tr>';
                    var j = i + 1;
                    if(curapp.arDealerList.length == j){
                        curapp.isDataLoaded();
                    }else{
                        curapp.currentDealerDealList(j);
                    }

                }

            }
        }
    );
};




application.prototype.processUserInterface = function(screen){
    var curapp = this;
    $('#user-name').html(curapp.currentUser);
    $("#user-name--first-letter").html(curapp.currentUser[0]);
    $("#dealersList").html(curapp.dealersHTML);
    curapp.resizeFrame();
    curapp.dealersHTML = "";
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


















/* Installation */


application.prototype.prepareEntity = function(arEntityDesc) {
    var batch = [];
    batch.push(['entity.add', {'ENTITY': arEntityDesc.NAME, 'NAME': arEntityDesc.DESC, 'ACCESS': {AU: 'W'}}]);
    batch.push(['entity.update', {'ENTITY': arEntityDesc.NAME, 'ACCESS': {AU: 'W'}}]);

    for(indexProperty in arEntityDesc.PROPERTIES)
        batch.push(['entity.item.property.add', {
            ENTITY: arEntityDesc.NAME,
            PROPERTY: arEntityDesc.PROPERTIES[indexProperty].CODE,
            NAME: arEntityDesc.PROPERTIES[indexProperty].NAME,
            TYPE: arEntityDesc.PROPERTIES[indexProperty].TYPE
        }]);

    return batch;
};





// Создание хранилищ
application.prototype.finishInstallation = function(arInfo){
    var arInfoEntity  = {
        NAME: "info",
        DESC: 'Хранилище с установовчными данными приложения',
        PROPERTIES: [
            {CODE: 'DEALER_CONTACT_TYPE', NAME: 'Тип Контактов Дилеров', TYPE: 'S'},
            {CODE: 'CURRENCY', NAME: 'Валюта', TYPE: 'S'},
            {CODE: 'RATE', NAME: 'Курс доллара', TYPE: 'N'}
        ]
    };

    var arDealingsEntity  = {
        NAME: "dealings",
        DESC: 'Хранилище для хранения сделок с дилерами',
        PROPERTIES: [
            {CODE: 'ORDER_ID', NAME: 'ID сделки', TYPE: 'N'},
            {CODE: 'DEALER_ID', NAME: 'ID дилера', TYPE: 'N'},
            {CODE: 'ARTICUL', NAME: 'Артикул сделки', TYPE: 'S'},
            {CODE: 'DATE_START', NAME: 'Дата получения заказа', TYPE: 'S'},
            {CODE: 'DATE_END', NAME: 'Дата отправки заказа', TYPE: 'S'},
            {CODE: 'DATE_STATUS', NAME: 'Статус отправки', TYPE: 'S'},
            {CODE: 'PAYMENT_STATUS', NAME: 'Статус оплаты', TYPE: 'S'},
            {CODE: 'NAME', NAME: 'Имя сделки', TYPE: 'S'},
            {CODE: 'TOTAL_SUM', NAME: 'Сумма сделки итого', TYPE: 'N'},
            {CODE: 'CURRENCY_VALUE', NAME: 'Курс доллара', TYPE: 'N'}
        ]
    };
    var arDealingsItemsEntity  = {
        NAME: "dealings_items",
        DESC: 'Хранилище для хранения позиций в сделках',
        PROPERTIES: [
            {CODE: 'ITEM_ID', NAME: 'ID позиции', TYPE: 'N'},
            {CODE: 'ORDER_ID', NAME: 'ID сделки', TYPE: 'N'},
            {CODE: 'ITEM_PRICE', NAME: 'Цена позиции', TYPE: 'N'}
        ]
    };

    var arDealersPriceEntity  = {
        NAME: "dealings_price",
        DESC: 'Хранилище для хранения цен позиций для каждого',
        PROPERTIES: [
            {CODE: 'ITEM_ID', NAME: 'ID позиции', TYPE: 'N'},
            {CODE: 'DEALER_ID', NAME: 'ID дилера', TYPE: 'N'},
            {CODE: 'DEALER_PRICE', NAME: 'Цена позиции', TYPE: 'N'},
            {CODE: 'ITEM_NAME', NAME: 'Имя позиции', TYPE: 'S'}
        ]
    };

    var arEntityBatch = this.prepareEntity(arInfoEntity);

    arEntityBatch.push(['entity.item.add', {
        ENTITY: 'info',
        DATE_ACTIVE_FROM: new Date(),
        NAME: 'Тип Контактов Дилеров',
        PROPERTY_VALUES: {
            DEALER_CONTACT_TYPE: arInfo.DEALER_CONTACT_TYPE
        }
    }]);

    var curapp = this;

    BX24.callBatch(arEntityBatch, function(result) {
        BX24.callMethod('entity.item.get', {
            ENTITY: "info",
            SORT: {DATE_ACTIVE_FROM: 'ASC'}
            },

            function (result) {
                if(result.error()){
                    console.error(result.error());
                }else{
                    BX24.installFinish();
                }
            }
        );
    });


};




application.prototype.chooseContactGroup = function(dialog){
    BX24.callMethod(
        "crm.status.entity.items",
        {
            entityId: 'CONTACT_TYPE'
        },
        function(result)
        {
            if(result.error())
                console.error(result.error());
            else
                console.dir(result.data());
                var resultHTML = '';
                result.data().forEach(function(item, i, arr) {
                    resultHTML += "<button data-id='"+item.STATUS_ID+"' class='mdl-button mdl-js-button mdl-button--raised mdl-button--colored'>"+item.NAME+"</button>";
                });
                dialog.querySelector('.mdl-dialog__content').innerHTML = resultHTML;
        }
    );
};






app = new application();


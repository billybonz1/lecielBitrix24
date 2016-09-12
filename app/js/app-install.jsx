/* Installation */

application.prototype.prepareEntity = function(arEntityDesc) {
    var batch = [];
    batch.push(['entity.add', {'ENTITY': arEntityDesc.NAME, 'NAME': arEntityDesc.DESC, 'ACCESS': {AU: 'W'}}]);
    batch.push(['entity.update', {'ENTITY': arEntityDesc.NAME, 'ACCESS': {AU: 'W'}}]);

    for(let indexProperty in arEntityDesc.PROPERTIES)
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

var app = new application();

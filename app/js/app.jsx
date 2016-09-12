// Application

function application(){
}



application.prototype.isDataLoaded = function(){
    for(let keyIndex in this.appLoadedKeys)
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
                for (let indexDeal in dataDeal){
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

                    curapp.arDealerList[i].rowClass = rowClass;
                    curapp.arDealerList[i].DEBT_SUM = curapp.DEBT_SUM;

                    var j = i + 1;
                    if(curapp.arDealerList.length == j){
                        curapp.appLoadedKeys['dealers-list'].loaded = true;
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
    ReactDOM.render(
        <div class="mdl-grid">
            <div className="mdl-cell mdl-cell--12-col">
                <UserName firstletter={curapp.currentUser[0]} name={curapp.currentUser} />
            </div>
            <div className="mdl-cell mdl-cell--12-col">
                <DealersBox data={curapp.arDealerList} />
            </div>
        </div>,
        document.getElementById('content')
    );
    console.log(curapp.arDealerList);
    curapp.resizeFrame();
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












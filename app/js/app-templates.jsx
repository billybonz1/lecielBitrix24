// React Templates

function UserName(props) {
    return (
        <span className="mdl-chip mdl-chip--contact">
                <span className="mdl-chip__contact mdl-color--teal mdl-color-text--white">{props.firstletter}</span>
                <span className="mdl-chip__text">{props.name}</span>
        </span>
    );
}


var DealersBox = React.createClass({
    render: function() {
        return (

            <table className="mdl-data-table mdl-js-data-table mdl-shadow--2dp dealList">
                <thead>
                <tr>
                    <th>ID</th>
                    <th className="mdl-data-table__cell--non-numeric">Имя дилера</th>
                    <th className="mdl-data-table__cell--non-numeric">Сумма долга</th>
                </tr>
                </thead>

                <DealersList data={this.props.data} />

            </table>
        );
    }
});



var DealersList = React.createClass({
    render: function() {
        var dealersNodes = this.props.data.map(function(dealer) {
            return (
                <tr className={dealer.rowClass}>
                    <th scope="row">{dealer.ID}</th>
                    <td className="mdl-data-table__cell--non-numeric">{dealer.NAME} {dealer.LAST_NAME}</td>
                    <td className="mdl-data-table__cell--non-numeric">{dealer.DEBT_SUM}</td>
                </tr>
            );
        });
        return (
            <tbody>
                {dealersNodes}
            </tbody>
        );
    }
});








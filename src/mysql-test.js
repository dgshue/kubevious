const _ = require('the-lodash');
const logger = require('./logger');
logger.info("init");

const MysqlDriver = require("./lib/utils/mysql-driver");
var mysqldriver = new MysqlDriver(logger);

const HistoryAccessor = require("./lib/history/db-accessor");
var historyAccessor = new HistoryAccessor(logger, mysqldriver);

mysqldriver.connect()


mysqldriver.onConnect(() => {
    logger.info("!!! CONNECTED");

    var snapDate = new Date("2020-02-06T02:18:22.000Z");
    var diffDate = new Date("2020-02-06T02:20:01.000Z");
    var snapshotObj = null;
    var diffObj = null;

    Promise.resolve()
        .then(() => historyAccessor.fetchSnapshot(snapDate))
        .then(fetchedItem => {
            snapshotObj = fetchedItem;
            logger.info("!!! FETCHED SNAPSHOT: ", snapshotObj);
        })
        .then(() => mysqldriver.executeStatement('GET_SNAPSHOTS'))
        .then((results) => {
            logger.info("!!! GET_SNAPSHOTS ALL RESULT: ", results);
        })
        .then(() => {
            // return historyAccessor.insertSnapshotItem(snapshotObj.id, 'zzz/bbb/ddd/ccc', null, {apiversion: 'v1', kind: 'POD'})
            // return historyAccessor.insertSnapshotItem(snapshotObj.id, 'zzz/bbb/ddd/ccc', { kind: 'props', name: 'config' }, {apiversion: 'v1', kind: 'POD'})
        })
        .then(() => {
            return historyAccessor.querySnapshotItems(snapshotObj.id)
                .then(results => {
                    logger.info("!!! SNAPSHOT ITEMS: ", results);
                })
        })
        .then(() => historyAccessor.fetchDiff(snapshotObj.id, diffDate))
        .then(fetchedItem => {
            diffObj = fetchedItem;
            logger.info("!!! FETCHED DIFF: ", diffObj);
        })
        .then(() => {
            return historyAccessor.insertDiffItem(diffObj.id, 'zzz/bbb/ddd/ccc', { kind: 'props', name: 'config' }, true, {apiversion: 'v1', kind: 'POD'})
            // return historyAccessor.insertDiffItem(diffObj.id, 'zzz/bbb/ddd/ccc/ddd', { kind: 'props', name: 'resources' }, false, null)
        })
        .then(() => {
            return historyAccessor.queryDiffItems(diffObj.id)
                .then(results => {
                    logger.info("!!! DIFF ITEMS: ", results);
                })
        })
        .catch(reason => {
            logger.error("!!! ERROR: ", reason);
        })
})
   
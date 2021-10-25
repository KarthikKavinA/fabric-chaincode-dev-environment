'use strict';

const { Contract } = require('fabric-contract-api');

class SimpleContract extends Contract {


    async put(ctx, objType, key, value) {
        const compositeKey = this._createCompositeKey(ctx, objType, key);
        await ctx.stub.putState(compositeKey, Buffer.from(value));
    }

    async get(ctx, objType, key) {
        const compositeKey = this._createCompositeKey(ctx, objType, key);
        const value = await ctx.stub.getState(compositeKey);
        if (!value || value.length === 0) {
            throw new Error(`The asset ${key} of type ${objType} does not exist`);
        }

        return value.toString();
    }

    async del(ctx, objType, key) {
        const compositeKey = this._createCompositeKey(ctx, objType, key);
        await ctx.stub.deleteState(compositeKey);
    }
    
    async getByRange(ctx, keyFrom, keyTo) {
        const iteratorPromise = ctx.stub.getStateByRange(keyFrom, keyTo);
        
        let results = [];
        for await (const res of iteratorPromise) {
            results.push({
                key:   res.key,
                value: res.value.toString()
            });
        }

        return JSON.stringify(results);
    }

    async getByRangeWithPagination(ctx, keyFrom, keyTo, pageSize, bookmark) {

        const {iterator, metadata} = await ctx.stub.getStateByRangeWithPagination(keyFrom, keyTo, parseInt(pageSize), bookmark);
        let results = await this.GetAllResults(iterator, false);

        console.log("metadata: ", metadata)
        console.log("bookmark: ", metadata.bookmark)
        console.log("count: ", metadata.fetchedRecordsCount)
        results.push({
			RecordsCount: metadata.fetchedRecordsCount,
			Bookmark: metadata.bookmark,
        });

		return JSON.stringify(results);
    }

    async getByType(ctx, objType) {
        const iteratorPromise = ctx.stub.getStateByPartialCompositeKey(objType, []);
        
        let results = [];
        for await (const res of iteratorPromise) {
            const splitKey = ctx.stub.splitCompositeKey(res.key);
            results.push({
                objType: splitKey.objectType,
                key:     splitKey.attributes[0],
                value:   res.value.toString()
            });
        }

        return JSON.stringify(results);
    }

    _createCompositeKey(ctx, objType, key) {
        if (!key || key === "") {
            throw new Error(`A key should be a non-empty string`);
        }

        if (objType === "") {
            return key;
        }

        return ctx.stub.createCompositeKey(objType, [key]);
    }


    async GetAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes = {};
				console.log(res.value.value.toString('utf8'));
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.tx_id;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						//jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                        jsonRes.Record = res.value.value.toString('utf8');
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}
}

module.exports = SimpleContract;
/**
 * Livechat Customer model
 */
class LivechatCustomer extends RocketChat.models._Base {
	constructor() {
		super();
		this._initModel('livechat_customer');
	}

	// FIND
	findOneById(_id, options) {
		const query = { _id: _id };

		return this.findOne(query, options);
	}

	findByCustomerId(_id, options) {
		const query = { _id: _id };

		return this.find(query, options);
	}

	createOrUpdateCustomer(_id, name) {
		var record = {
			name: name
		};

		if (_id) {
			this.update({ _id: _id }, { $set: record });
		} else {
			_id = this.insert(record);
		}

		return _.extend(record, { _id: _id });
	}

	// REMOVE
	removeById(_id) {
		const query = { _id: _id };

		return this.remove(query);
	}
}

RocketChat.models.LivechatCustomer = new LivechatCustomer();

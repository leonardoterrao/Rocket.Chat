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

	createOrUpdateCustomer(_id, name, agents) {
		agents = [].concat(agents);

		var record = {
			name: name,
			numAgents: agents.length
		};

		if (_id) {
			this.update({ _id: _id }, { $set: record });
		} else {
			_id = this.insert(record);
		}

		var savedAgents = _.pluck(RocketChat.models.LivechatCustomerAgents.findByCustomerId(_id).fetch(), 'agentId');
		var agentsToSave = _.pluck(agents, 'agentId');

		// remove other agents
		_.difference(savedAgents, agentsToSave).forEach((agentId) => {
			RocketChat.models.LivechatCustomerAgents.removeByCustomerIdAndAgentId(_id, agentId);
		});

		agents.forEach((agent) => {
			RocketChat.models.LivechatCustomerAgents.saveAgent({
				agentId: agent.agentId,
				customerId: _id,
				username: agent.username,
				count: agent.count ? parseInt(agent.count) : 0,
				order: agent.order ? parseInt(agent.order) : 0
			});
		});

		return _.extend(record, { _id: _id });
	}

	// REMOVE
	removeById(_id) {
		const query = { _id: _id };

		return this.remove(query);
	}
}

RocketChat.models.LivechatCustomer = new LivechatCustomer();

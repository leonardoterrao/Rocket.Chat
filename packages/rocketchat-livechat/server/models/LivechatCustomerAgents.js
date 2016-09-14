/**
 * Livechat CustomerAgents model
 */
class LivechatCustomerAgents extends RocketChat.models._Base {
	constructor() {
		super();
		this._initModel('livechat_customer_agents');
	}

	findByCustomerId(customerId) {
		return this.find({ customerId: customerId });
	}

	saveAgent(agent) {
		return this.upsert({
			agentId: agent.agentId,
			customerId: agent.customerId
		}, {
			$set: {
				username: agent.username,
				count: parseInt(agent.count),
				order: parseInt(agent.order)
			}
		});
	}

	removeByCustomerIdAndAgentId(customerId, agentId) {
		this.remove({ customerId: customerId, agentId: agentId });
	}

	getNextAgentForCustomer(customerId) {
		var agents = this.findByCustomerId(customerId).fetch();

		if (agents.length === 0) {
			return;
		}

		var onlineUsers = RocketChat.models.Users.findOnlineUserFromList(_.pluck(agents, 'username'));

		var onlineUsernames = _.pluck(onlineUsers.fetch(), 'username');

		var query = {
			customerId: customerId,
			username: {
				$in: onlineUsernames
			}
		};

		var sort = {
			count: 1,
			order: 1,
			username: 1
		};
		var update = {
			$inc: {
				count: 1
			}
		};

		var collectionObj = this.model.rawCollection();
		var findAndModify = Meteor.wrapAsync(collectionObj.findAndModify, collectionObj);

		var agent = findAndModify(query, sort, update);
		if (agent) {
			return {
				agentId: agent.agentId,
				username: agent.username
			};
		} else {
			return null;
		}
	}

	getOnlineForCustomer(customerId) {
		var agents = this.findByCustomerId(customerId).fetch();

		if (agents.length === 0) {
			return;
		}

		var onlineUsers = RocketChat.models.Users.findOnlineUserFromList(_.pluck(agents, 'username'));

		var onlineUsernames = _.pluck(onlineUsers.fetch(), 'username');

		var query = {
			customerId: customerId,
			username: {
				$in: onlineUsernames
			}
		};

		var customerAgents = this.find(query);

		if (customerAgents) {
			return customerAgents;
		} else {
			return null;
		}
	}

	findUsersInQueue(usersList) {
		let query = {};

		if (!_.isEmpty(usersList)) {
			query.username = {
				$in: usersList
			};
		}

		let options = {
			sort: {
				customerId: 1,
				count: 1,
				order: 1,
				username: 1
			}
		};

		return this.find(query, options);
	}
}

RocketChat.models.LivechatCustomerAgents = new LivechatCustomerAgents();

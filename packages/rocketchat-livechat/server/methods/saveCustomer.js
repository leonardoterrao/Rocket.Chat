/* eslint new-cap: [2, {"capIsNewExceptions": ["Match.ObjectIncluding", "Match.Optional"]}] */

Meteor.methods({
	'livechat:saveCustomer'(_id, customerData, customerAgents) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:saveCustomer' });
		}

		if (_id) {
			check(_id, String);
		}

		check(customerData, Match.ObjectIncluding({ name: String }));

		if (_id) {
			const customer = RocketChat.models.LivechatCustomer.findOneById(_id);
			if (!customer) {
				throw new Meteor.Error('error-customer-not-found', 'Customer not found', { method: 'livechat:saveCustomer' });
			}
		}

		return RocketChat.models.LivechatCustomer.createOrUpdateCustomer(_id, customerData.name, customerAgents);
	}
});

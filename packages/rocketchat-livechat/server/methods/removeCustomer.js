Meteor.methods({
	'livechat:removeCustomer'(_id) {
		if (!Meteor.userId() || !RocketChat.authz.hasPermission(Meteor.userId(), 'view-livechat-manager')) {
			throw new Meteor.Error('error-not-allowed', 'Not allowed', { method: 'livechat:removeCustomer' });
		}

		check(_id, String);

		var customer = RocketChat.models.LivechatCustomer.findOneById(_id, { fields: { _id: 1 } });

		if (!customer) {
			throw new Meteor.Error('customer-not-found', 'Customer not found', { method: 'livechat:removeCustomer' });
		}

		return RocketChat.models.LivechatCustomer.removeById(_id);
	}
});

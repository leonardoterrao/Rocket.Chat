Meteor.publish('livechat:customerAgents', function(customerId) {
	if (!this.userId) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:customerAgents' }));
	}

	if (!RocketChat.authz.hasPermission(this.userId, 'view-l-room')) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:customerAgents' }));
	}

	if (customerId) {
		return RocketChat.models.LivechatCustomerAgents.find({ customerId: customerId });
	}

	return RocketChat.models.LivechatCustomerAgents.find({});
});

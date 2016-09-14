Meteor.publish('livechat:customers', function(_id) {
	if (!this.userId) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:customers' }));
	}

	if (!RocketChat.authz.hasPermission(this.userId, 'view-l-room')) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:customers' }));
	}

	if (_id !== undefined) {
		return RocketChat.models.LivechatCustomer.findByCustomerId(_id);
	} else {
		return RocketChat.models.LivechatCustomer.find();
	}

});

Template.visitorForward.helpers({
	visitor() {
		return Template.instance().visitor.get();
	},
	hasDepartments() {
		var room = Template.instance().room.get();
		return LivechatDepartment.find({ enabled: true, 'customer._id': room.customer._id }).count() > 0;
	},
	departments() {
		var room = Template.instance().room.get();
		return LivechatDepartment.find({ enabled: true, 'customer._id': room.customer._id });
	},
	agents() {
		var room = Template.instance().room.get();
		var agentsForCustomer = LivechatCustomerAgents.find({customerId: room.customer._id}).fetch();
		if (agentsForCustomer && agentsForCustomer.length > 0) {
			var agentIds = [];
			agentsForCustomer.forEach((agent) => {
				agentIds.push(agent.agentId);
			});

			let query = {
				$and: [
					{ _id: { $ne: Meteor.userId() }},
					{ _id: { $in: agentIds }}
				]
			};

			let options = {
				sort: { name: 1, username: 1 }
			};

			return AgentUsers.find(query, options);
		}
	},
	agentName() {
		return this.name || this.username;
	}
});

Template.visitorForward.onCreated(function() {
	this.visitor = new ReactiveVar();
	this.room = new ReactiveVar();

	this.autorun(() => {
		this.visitor.set(Meteor.users.findOne({ _id: Template.currentData().visitorId }));
	});

	this.autorun(() => {
		this.room.set(ChatRoom.findOne({ _id: Template.currentData().roomId }));
	});

	this.subscribe('livechat:departments');
	this.subscribe('livechat:customerAgents');
	this.subscribe('livechat:agents');
});


Template.visitorForward.events({
	'submit form'(event, instance) {
		event.preventDefault();

		const transferData = {
			roomId: instance.room.get()._id
		};

		if (instance.find('#forwardUser').value) {
			transferData.userId = instance.find('#forwardUser').value;
		} else if (instance.find('#forwardDepartment').value) {
			transferData.deparmentId = instance.find('#forwardDepartment').value;
		}

		Meteor.call('livechat:transfer', transferData, (error, result) => {
			if (error) {
				toastr.error(t(error.error));
			} else if (result) {
				this.save();
				toastr.success(t('Transferred'));
				FlowRouter.go('/');
			} else {
				toastr.warning(t('No_available_agents_to_transfer'));
			}
		});
	},

	'change #forwardDepartment, blur #forwardDepartment'(event, instance) {
		if (event.currentTarget.value) {
			instance.find('#forwardUser').value = '';
		}
	},

	'change #forwardUser, blur #forwardUser'(event, instance) {
		if (event.currentTarget.value) {
			instance.find('#forwardDepartment').value = '';
		}
	},

	'click .cancel'(event) {
		event.preventDefault();

		this.cancel();
	}
});

Template.livechatCustomerForm.helpers({
	customer() {
		return Template.instance().customer.get();
	},
	agents() {
		return Template.instance().customer && !_.isEmpty(Template.instance().customer.get()) ? Template.instance().customer.get().agents : [];
	},
	selectedAgents() {
		return _.sortBy(Template.instance().selectedAgents.get(), 'username');
	},
	availableAgents() {
		var selected = _.pluck(Template.instance().selectedAgents.get(), 'username');
		return AgentUsers.find({ username: { $nin: selected }}, { sort: { username: 1 } });
	}
});

Template.livechatCustomerForm.events({
	'submit #customer-form'(e, instance) {
		e.preventDefault();
		var $btn = instance.$('button.save');

		var _id = $(e.currentTarget).data('id');
		var name = instance.$('input[name=name]').val();

		if (name.trim() === '') {
			return toastr.error(t('Please_fill_a_label'));
		}

		var oldBtnValue = $btn.html();
		$btn.html(t('Saving'));

		var customerData = {
			name: name
		};

		var customerAgents = [];

		instance.selectedAgents.get().forEach((agent) => {
			agent.count = instance.$('.count-' + agent.agentId).val();
			agent.order = instance.$('.order-' + agent.agentId).val();

			customerAgents.push(agent);
		});

		Meteor.call('livechat:saveCustomer', _id, customerData, customerAgents, function(error) {
			$btn.html(oldBtnValue);
			if (error) {
				return handleError(error);
			}

			toastr.success(t('Saved'));
			FlowRouter.go('livechat-customers');
		});
	},

	'click button.back'(e/*, instance*/) {
		e.preventDefault();
		FlowRouter.go('livechat-customers');
	},

	'click .remove-agent'(e, instance) {
		e.preventDefault();

		var selectedAgents = instance.selectedAgents.get();
		selectedAgents = _.reject(selectedAgents, (agent) => { return agent._id === this._id; });
		instance.selectedAgents.set(selectedAgents);
	},

	'click .available-agents li'(e, instance) {
		var selectedAgents = instance.selectedAgents.get();
		var agent = _.clone(this);
		agent.agentId = this._id;
		delete agent._id;
		selectedAgents.push(agent);
		instance.selectedAgents.set(selectedAgents);
	}
});

Template.livechatCustomerForm.onCreated(function() {
	this.customer = new ReactiveVar({ enabled: true });
	this.selectedAgents = new ReactiveVar([]);

	this.subscribe('livechat:agents');

	this.autorun(() => {
		var sub = this.subscribe('livechat:customers', FlowRouter.getParam('_id'));
		if (sub.ready()) {
			const customer = LivechatCustomer.findOne({ _id: FlowRouter.getParam('_id') });
			if (customer) {
				this.customer.set(customer);

				this.subscribe('livechat:customerAgents', customer._id, () => {
					var newSelectedAgents = [];
					LivechatCustomerAgents.find({ customerId: customer._id }).forEach((agent) => {
						newSelectedAgents.push(agent);
					});
					this.selectedAgents.set(newSelectedAgents);
				});
			}
		}
	});
});

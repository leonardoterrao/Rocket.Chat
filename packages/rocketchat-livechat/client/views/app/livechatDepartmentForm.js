Template.livechatDepartmentForm.helpers({
	department() {
		return Template.instance().department.get();
	},
	agents() {
		return Template.instance().department && !_.isEmpty(Template.instance().department.get()) ? Template.instance().department.get().agents : [];
	},
	selectedAgents() {
		return _.sortBy(Template.instance().selectedAgents.get(), 'username');
	},
	availableAgents() {
		var selected = _.pluck(Template.instance().selectedAgents.get(), 'username');

		var customerId = $('#customerSelector').val();
		if (!customerId && customerId !== '' && Template.instance().department.get().customer) {
			customerId = Template.instance().department.get().customer._id;
		}

		if (customerId) {
			var agentsForCustomer = LivechatCustomerAgents.find({customerId: customerId}).fetch();

			if (agentsForCustomer && agentsForCustomer.length > 0) {
				var agentIds = [];
				agentsForCustomer.forEach((agent) => {
					agentIds.push(agent.agentId);
				});

				return AgentUsers.find({ $and: [{_id: { $in: agentIds}}, { username: { $nin: selected }}]}, { sort: { username: 1 } });
			}
		}
	},
	customers() {
		return LivechatCustomer.find();
	}
});

Template.livechatDepartmentForm.events({
	'change #customerSelector'(e, instance) {
		e.preventDefault();
		instance.selectedAgents.set([]);
	},

	'submit #department-form'(e, instance) {
		e.preventDefault();
		var $btn = instance.$('button.save');

		var _id = $(e.currentTarget).data('id');
		var enabled = instance.$('input[name=enabled]:checked').val();
		var name = instance.$('input[name=name]').val();
		var description = instance.$('textarea[name=description]').val();
		var customerId = instance.$('select[name=customer]').val();

		if (enabled !== '1' && enabled !== '0') {
			return toastr.error(t('Please_select_enabled_yes_or_no'));
		}

		if (name.trim() === '') {
			return toastr.error(t('Please_fill_a_name'));
		}

		if (!customerId) {
			return toastr.error(t('Please_select_a_customer'));
		}

		var oldBtnValue = $btn.html();
		$btn.html(t('Saving'));

		var customer = LivechatCustomer.findOne(customerId);

		var departmentData = {
			enabled: enabled === '1',
			name: name.trim(),
			description: description.trim(),
			customer: {
				_id: customerId,
				name: customer.name
			}
		};

		var departmentAgents = [];

		instance.selectedAgents.get().forEach((agent) => {
			agent.count = instance.$('.count-' + agent.agentId).val();
			agent.order = instance.$('.order-' + agent.agentId).val();

			departmentAgents.push(agent);
		});

		Meteor.call('livechat:saveDepartment', _id, departmentData, departmentAgents, function(error/*, result*/) {
			$btn.html(oldBtnValue);
			if (error) {
				return handleError(error);
			}

			toastr.success(t('Saved'));
			FlowRouter.go('livechat-departments');
		});
	},

	'click button.back'(e/*, instance*/) {
		e.preventDefault();
		FlowRouter.go('livechat-departments');
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

Template.livechatDepartmentForm.onCreated(function() {
	this.department = new ReactiveVar({ enabled: true });
	this.selectedAgents = new ReactiveVar([]);

	this.subscribe('livechat:agents');
	this.subscribe('livechat:customers');
	this.subscribe('livechat:customerAgents');

	this.autorun(() => {
		var sub = this.subscribe('livechat:departments', FlowRouter.getParam('_id'));
		if (sub.ready()) {
			const department = LivechatDepartment.findOne({ _id: FlowRouter.getParam('_id') });
			if (department) {
				this.department.set(department);

				this.subscribe('livechat:departmentAgents', department._id, () => {
					var newSelectedAgents = [];
					LivechatDepartmentAgents.find({ departmentId: department._id }).forEach((agent) => {
						newSelectedAgents.push(agent);
					});
					this.selectedAgents.set(newSelectedAgents);
				});
			}
		}
	});
});

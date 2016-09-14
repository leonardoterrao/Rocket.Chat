Template.livechatCustomerForm.helpers({
	customer() {
		return Template.instance().customer.get();
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

		Meteor.call('livechat:saveCustomer', _id, customerData, function(error) {
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
	}
});

Template.livechatCustomerForm.onCreated(function() {
	this.customer = new ReactiveVar({});
	this.autorun(() => {
		var sub = this.subscribe('livechat:customers', FlowRouter.getParam('_id'));
		if (sub.ready()) {
			const customer = LivechatCustomer.findOne({ _id: FlowRouter.getParam('_id') });
			if (customer) {
				this.customer.set(customer);
			}
		}
	});
});

Template.livechatCustomers.helpers({
	customers() {
		return LivechatCustomer.find();
	}
});

Template.livechatCustomers.events({
	'click .remove-customer'(e/*, instance*/) {
		e.preventDefault();
		e.stopPropagation();

		swal({
			title: t('Are_you_sure'),
			type: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#DD6B55',
			confirmButtonText: t('Yes'),
			cancelButtonText: t('Cancel'),
			closeOnConfirm: false,
			html: false
		}, () => {
			Meteor.call('livechat:removeCustomer', this._id, function(error/*, result*/) {
				if (error) {
					return handleError(error);
				}
				swal({
					title: t('Removed'),
					text: t('Customer_removed'),
					type: 'success',
					timer: 1000,
					showConfirmButton: false
				});
			});
		});
	},

	'click .customer-info'(e/*, instance*/) {
		e.preventDefault();
		FlowRouter.go('livechat-customer-edit', { _id: this._id });
	}
});

Template.livechatCustomers.onCreated(function() {
	this.subscribe('livechat:customers');
});

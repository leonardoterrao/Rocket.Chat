BlazeLayout.setRoot('body');

FlowRouter.route '/livechat/:_livechatToken',
	name: 'index'

	triggersEnter: [
		->
			visitor.register()
	]

	action: ->
		BlazeLayout.render 'main', {center: 'livechatWindow'}

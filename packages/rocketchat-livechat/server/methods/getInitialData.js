Meteor.methods({
	'livechat:getInitialData'(visitorToken, livechatToken) {

		const customer = RocketChat.models.LivechatCustomer.findOneById(livechatToken);
		if (!customer) {
			throw new Meteor.Error('Invalid_livechat_token', 'Invalid token to use livechat in this website.');
		}

		var info = {
			enabled: null,
			title: null,
			color: null,
			registrationForm: null,
			room: null,
			triggers: [],
			departments: [],
			online: true,
			offlineColor: null,
			offlineMessage: null,
			offlineSuccessMessage: null,
			offlineUnavailableMessage: null,
			displayOfflineForm: null,
			videoCall: null
		};

		const room = RocketChat.models.Rooms.findOpenByVisitorToken(visitorToken, {
			fields: {
				name: 1,
				t: 1,
				cl: 1,
				u: 1,
				usernames: 1,
				v: 1
			}
		}).fetch();

		if (room && room.length > 0) {
			info.room = room[0];
		}

		const initSettings = RocketChat.Livechat.getInitSettings();

		info.title = initSettings.Livechat_title;
		info.color = initSettings.Livechat_title_color;
		info.enabled = initSettings.Livechat_enabled;
		info.registrationForm = initSettings.Livechat_registration_form;
		info.offlineTitle = initSettings.Livechat_offline_title;
		info.offlineColor = initSettings.Livechat_offline_title_color;
		info.offlineMessage = initSettings.Livechat_offline_message;
		info.offlineSuccessMessage = initSettings.Livechat_offline_success_message;
		info.offlineUnavailableMessage = initSettings.Livechat_offline_form_unavailable;
		info.displayOfflineForm = initSettings.Livechat_display_offline_form;
		info.language = initSettings.Language;
		info.videoCall = initSettings.Livechat_videocall_enabled === true && initSettings.Jitsi_Enabled === true;
		info.transcript = initSettings.Livechat_enable_transcript;
		info.transcriptMessage = initSettings.Livechat_transcript_message;


		RocketChat.models.LivechatTrigger.find().forEach((trigger) => {
			info.triggers.push(trigger);
		});

		RocketChat.models.LivechatDepartment.findEnabledWithAgents(livechatToken).forEach((department) => {
			info.departments.push(department);
		});

		var agents = RocketChat.models.LivechatCustomerAgents.findByCustomerId(livechatToken).fetch();

		if (agents.length === 0) {
			info.online = false;
			return info;
		}

		info.online = RocketChat.models.Users.findOnlineUserFromList(_.pluck(agents, 'username')).count() > 0;

		return info;
	}
});

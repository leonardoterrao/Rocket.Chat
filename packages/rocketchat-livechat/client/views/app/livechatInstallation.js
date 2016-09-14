Template.livechatInstallation.helpers({
	customers() {
		return LivechatCustomer.find();
	},
	script() {
		return loadScript('');
	}
});

Template.livechatInstallation.events({
	"change #customerSelector"(e, instance) {
		e.preventDefault();
		var customer = e.target.value;
		$('#script').val(loadScript(customer));
	}
});

function loadScript(customer) {
	let siteUrl = s.rtrim(RocketChat.settings.get('Site_Url'), '/');

	return `<!-- Start of Rocket.Chat Livechat Script -->
<script type="text/javascript">
(function(w, d, s, u) {
	w.RocketChat = function(c) { w.RocketChat._.push(c) }; w.RocketChat._ = []; w.RocketChat.url = u;
	var h = d.getElementsByTagName(s)[0], j = d.createElement(s);
	j.async = true; j.src = '${siteUrl}/packages/rocketchat_livechat/assets/rocket-livechat.js';
	h.parentNode.insertBefore(j, h);
})(window, document, 'script', '${siteUrl}/livechat/${customer}');
</script>
<!-- End of Rocket.Chat Livechat Script -->`;
}

Template.livechatInstallation.onCreated(function() {
	this.subscribe('livechat:customers');
});

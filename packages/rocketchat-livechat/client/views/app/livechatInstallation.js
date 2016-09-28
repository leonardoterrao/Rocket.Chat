function loadScript(customer) {
	let siteUrl = s.rtrim(RocketChat.settings.get('Site_Url'), '/');

	return `<!-- Start of Rocket.Chat Livechat Script -->
<script type="text/javascript">
(function(w, d, s, u) {
	w.RocketChat = function(c) { w.RocketChat._.push(c) }; w.RocketChat._ = []; w.RocketChat.url = u;
	var h = d.getElementsByTagName(s)[0], j = d.createElement(s);
	j.async = true; j.src = '${siteUrl}/packages/rocketchat_livechat/assets/rocket-livechat.js';
	h.parentNode.insertBefore(j, h);
})(window, document, 'script', '${siteUrl}/livechat?livechatToken=${customer}');
</script>
<!-- End of Rocket.Chat Livechat Script -->`;
}

Template.livechatInstallation.helpers({
	customers() {
		return LivechatCustomer.find();
	},
	script() {
		var firstCustomer = LivechatCustomer.find().fetch()[0];
		if (firstCustomer) {
			return loadScript(firstCustomer._id);
		}
	}
});

Template.livechatInstallation.events({
	'change #customerSelector'(e) {
		e.preventDefault();
		var customer = e.target.value;
		$('#script').val(loadScript(customer));
	}
});

Template.livechatInstallation.onCreated(function() {
	this.subscribe('livechat:customers');
});

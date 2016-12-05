import urllib.request as net
import json

class VKApi:

	def __init__(self):
		a = ""

	def get_friends(self, user_id):
		data = net.urlopen("https://api.vk.com/method/friends.get?user_id="+str(user_id)).read().decode('utf-8')
		data = json.loads(data)
		try:
			return data["response"]
		except Exception:
			return []
	
	def get_user(self, user_list):
		list = ",".join(str(u) for u in user_list)
		data = net.urlopen("https://api.vk.com/method/users.get?user_ids="+list+"&v=5.52").read().decode('utf-8')
		data = json.loads(data)
		try:
			return data["response"]
		except Exception:
			return []

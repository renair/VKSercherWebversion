import vk
from sys import stdout
from collections import deque
from Cacher import MongoCacher

class Finder:
	
	def __init__(self):
		self.vk = vk.VKApi()
		self.cacher = MongoCacher('localhost',27017,'vk','friends')

	def serch(self, start, end):
		api = self.vk
		viewed = []
		to_serch = deque([start])
		ancestors = dict()
		result = []
		while len(viewed) < 10000:
			serch_id = to_serch.popleft()
			if serch_id not in viewed:
				friends = self.cacher.load_with_callback(serch_id, api.get_friends)	# using mongo cacher #api.get_friends(serch_id)
				#print(str(len(viewed)))
				stdout.write(str(len(viewed))+"\n")
				for user in friends:
					if not ancestors.get(user):
						ancestors[user] = serch_id
				if end in friends:
					#print("Yeah found!!!")
					result.append(end)
					while ancestors[end] != start:
						result.append(ancestors[end])
						end = ancestors[end]
					result.append(start)
					viewed.clear()
					to_serch.clear()
					ancestors.clear()
					return result
				elif len(to_serch) < 20000:
					to_serch.extend(friends)
				viewed.append(serch_id)
			stdout.flush()
#			else:
#				print(str(serch_id)+"already seen")
		viewed.clear()
		to_serch.clear()
		ancestors.clear()
		return result

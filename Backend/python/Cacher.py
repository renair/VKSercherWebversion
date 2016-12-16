import pickle
import os
import os.path as paths
from pymongo import MongoClient

class PickleCacher:
	def __init__(self,folder='./cache'):
		self.cached = []
		for files in os.listdir(folder):
			if paths.isfile(filies):
				try:
					self.cached.add(int(files))
				except Exception:
					print(file+' is not cache file!')

	def cache(self,name,value):
		try:
			picle.dump(value,open(str(name),'wb+'))
		except Exception:
			print(str(value)+' not cached')

	def load(self,name):
		try:
			if int(name) in self.cached:
				return pickle.load(open(str(name),'rb+'))
			else:
				return []
		except Exception:
			return []

	def cached(self,name):
		return int(name) in self.cached

class MongoCacher:
	#self.mongo_client
	#self.db
	#self.collection
	def __init__(self, host, port, db_name='', collection_name=''):
		try:
			self.mongo_client = MongoClient(host, port)
			if db_name:
				self.select_db(db_name)
			if collection_name:
				self.select_collection(collection_name)
		except Exception:
			print("Can't connect to db")
	
	def select_db(self, db_name):
		self.db = self.mongo_client[db_name]

	def select_collection(self, collection_name):
		self.collection = self.db[collection_name]

	def is_ready(self):
		return hasattr(self,'db') and hasattr(self,'collection')

	def cache(self, name, value):
		if not self.is_ready():
			return False 
		return self.collection.insert_one({"user_id":name,"friends":value})
	
	def load(self, name):
		try:
			if self.is_ready():
				data = self.collection.find_one({"user_id":name})
				if data:
					return data
				else:
					return []
		except Exception:
			print("Exception in getting data")
	
	def load_with_callback(self, name, callback):
		data = self.load(name)
		if not data:
			data = callback(name)
			self.cache(name, data)
			return data
		else:
			return data['friends']

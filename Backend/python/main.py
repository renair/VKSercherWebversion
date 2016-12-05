import vk
import sys
import signal
import VKFinder

#bing exit on SIGTERM
signal.signal(signal.SIGTERM, lambda sig,frame: exit())

vk_finder = VKFinder.Finder()
vk_api = vk.VKApi()
first = sys.argv[1]
target = sys.argv[2]

#test cases
#users = vk_finder.serch(30851865,20056802) # 4-th friend with Castle.... mimimimi
#users = vk_finder.serch(30851865,35794528) #Nikita
#users = vk_finder.serch(30851865,8627177) #Ihor friend
#users = vk_finder.serch(30851865, 6347171)
#users = vk_finder.serch(173852943,9774099) #Taya - Yuara Gromovoi
#users = vk_finder.serch(30851865, 648509)
#users = vk_finder.serch(30851865,283505314)
#users = vk_finder.serch(23342234,24234624)
users = vk_finder.serch(int(first), int(target))

users = vk_api.get_user(users)
users.reverse()
for user in users:
	print(user['first_name']+" "+user['last_name'],end=" -> ")

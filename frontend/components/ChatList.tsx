import Image from 'next/image';

const ChatList = ({ onSelectUser }) => {
  const users = [
    { username: "Jessica Koel", img: "/images/men1.jpg", message: "Hey, Joel, I'm here to help you out, please tell me", time: "11:26" },
    { username: "Komeial Bolger", img: "/images/men2.jpg", message: "I will send you all documents as soon as possible", time: "12:26" },
    { username: "Tamaara Suiale", img: "/images/men3.jpg", message: "Are you going on a business trip next week?", time: "8:26" },
    { username: "Sam Nielson", img: "/images/men4.jpg", message: "I suggest starting a new business soon", time: "7:16" },
    { username: "Caroline Nexon", img: "/images/men5.jpg", message: "We need to start a new research center.", time: "9:26" },
    { username: "Patrick Koeler", img: "/images/men6.jpg", message: "Maybe yes", time: "3:26" },
  ];

  return (
   
      <div className="max-w-full w-full  mx-auto   shadow-lg rounded-lg overflow-hidden md:max-w-lg">
  
          <ul>
            {users.map((user, index) => (
              <li
                key={index}
                className="flex justify-between items-center mt-2 p-2 hover:shadow-lg rounded cursor-pointer transition"
                onClick={() => onSelectUser(user)} // Send selected user to parent
              >
                <div className="flex ml-2">
                  <Image src={user.img} width={40} height={40} className="rounded-full" alt={user.username} />
                  <div className="flex flex-col ml-2">
                    <span className="font-medium text-black">{user.username}</span>
                    <span className="text-sm text-gray-400 truncate w-32">{user.message}</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-gray-300">{user.time}</span>
                  <i className="fa fa-star text-green-400"></i>
                </div>
              </li>
            ))}
          </ul>
        </div>
      
    
  );
};

export default ChatList;

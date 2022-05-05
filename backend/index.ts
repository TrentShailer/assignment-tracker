import Fastify from "fastify";
const fastify = Fastify({
	logger: true,
});

import mainRoute from "./mainRoute";

fastify.register(mainRoute);

const start = async () => {
	try {
		await fastify.listen(2005);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();

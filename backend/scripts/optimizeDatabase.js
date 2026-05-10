// Database optimization script - run this after updating models
import mongoose from 'mongoose';
import Article from '../src/model/article.model.js';
import GenImg from '../src/model/image.model.js';
import Blogtitle from '../src/model/blogtitle.model.js';
import RemoveBG from '../src/model/removeBG.model.js';
import User from '../src/model/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const optimizeDatabase = async () => {
    try {
        console.log('🚀 Starting database optimization...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const collections = [
            { name: 'Article', model: Article },
            { name: 'GenImg', model: GenImg },
            { name: 'Blogtitle', model: Blogtitle },
            { name: 'RemoveBG', model: RemoveBG },
            { name: 'User', model: User }
        ];

        // Create indexes for each collection
        for (const { name, model } of collections) {
            console.log(`\n📊 Processing ${name} collection...`);
            
            try {
                // Ensure indexes are created
                await model.ensureIndexes();
                console.log(`✅ ${name} indexes ensured`);
                
                // Get index information
                const indexes = await model.collection.getIndexes();
                console.log(`📋 ${name} indexes:`, Object.keys(indexes).map(key => ({
                    name: key,
                    key: indexes[key].key || indexes[key]
                })));
                
                // Get collection stats
                const stats = await model.collection.stats();
                console.log(`📈 ${name} stats:`, {
                    documents: stats.count || 0,
                    avgSize: `${((stats.avgObjSize || 0) / 1024).toFixed(2)} KB`,
                    totalSize: `${((stats.size || 0) / 1024 / 1024).toFixed(2)} MB`,
                    indexes: stats.nindexes || 0
                });
                
            } catch (error) {
                console.error(`❌ Error processing ${name}:`, error.message);
            }
        }

        // Analyze slow queries (if profiling is enabled)
        try {
            console.log('\n🔍 Checking for slow queries...');
            const db = mongoose.connection.db;
            
            // Check if profiling is enabled
            const profileStatus = await db.runCommand({ profile: -1 });
            
            if (profileStatus.was > 0) {
                const slowQueries = await db.collection('system.profile')
                    .find({ ts: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
                    .sort({ ts: -1 })
                    .limit(10)
                    .toArray();
                
                if (slowQueries.length > 0) {
                    console.log('🐌 Recent slow queries:');
                    slowQueries.forEach((query, index) => {
                        console.log(`${index + 1}. ${query.ns}: ${query.millis}ms`);
                        if (query.command) {
                            console.log(`   Command: ${JSON.stringify(query.command).substring(0, 100)}...`);
                        }
                    });
                } else {
                    console.log('✅ No slow queries found in the last 24 hours');
                }
            } else {
                console.log('ℹ️ Database profiling is not enabled. To enable:');
                console.log('   db.setProfilingLevel(1, { slowms: 100 })');
            }
        } catch (error) {
            console.log('⚠️ Could not check slow queries:', error.message);
        }

        // Performance recommendations
        console.log('\n💡 Performance Recommendations:');
        console.log('1. Monitor query performance using MongoDB Compass or profiler');
        console.log('2. Consider adding more specific compound indexes based on actual query patterns');
        console.log('3. Use aggregation pipelines for complex data analysis');
        console.log('4. Implement field selection (projection) to reduce data transfer');
        console.log('5. Use lean() queries when you don\'t need Mongoose document features');

        console.log('\n🎉 Database optimization completed!');
        
    } catch (error) {
        console.error('❌ Database optimization failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run optimization
optimizeDatabase();
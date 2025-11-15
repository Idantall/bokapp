# ✅ Official Supabase MCP Setup Guide

## 📚 Based on Official Documentation
https://supabase.com/docs/guides/getting-started/mcp

---

## 🔧 Correct Configuration

I've updated your `~/.cursor/mcp.json` with the **official** Supabase MCP configuration:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=vpqxigieedjwqmxducku"
    }
  }
}
```

This uses the **hosted Supabase MCP server** with OAuth authentication (not direct PostgreSQL connection).

---

## 🔄 Next Steps

### 1. Restart Cursor
**Close and reopen Cursor completely** for the changes to take effect.

### 2. Authenticate
When you restart Cursor, it should prompt you to:
- Log in to your Supabase account
- Select your organization
- Select your project (`vpqxigieedjwqmxducku`)
- Grant permissions

### 3. Verify It Works
After authentication, tell me:
> "Can you list tables in my database?"

If I can show you the tables, it's working! 🎉

---

## 🛠️ Available MCP Tools

Once configured, the Supabase MCP provides these tools:

### Database Operations:
- **`query`** - Execute SQL queries
- **`list_tables`** - List all tables
- **`describe_table`** - Get table schema
- **`list_functions`** - List database functions
- **`list_policies`** - List RLS policies

### Project Management:
- **`get_project_info`** - Get project details
- **`list_schemas`** - List database schemas

---

## 🔐 Security Best Practices

According to official docs:

### ⚠️ Use in Development Only
The MCP server should **only be used in development environments**, not production.

### 🔒 What to Protect:
- Don't share your MCP session tokens
- Review what queries I execute before confirming
- Limit my access to development projects only

### ✅ Safe to Do:
- Create tables and migrations
- Query data
- Modify RLS policies
- Run database functions

---

## 🎯 How It Works

```
Cursor (You)
    ↓
  My AI (Claude)
    ↓
Supabase MCP Server (https://mcp.supabase.com)
    ↓
Your Supabase Project (vpqxigieedjwqmxducku)
    ↓
PostgreSQL Database
```

### Authentication Flow:
1. You log in to Supabase via OAuth
2. You grant permissions to the MCP server
3. MCP server gets a token for your project
4. I can execute SQL via the MCP server
5. All queries are logged and auditable

---

## 🧪 Testing the Setup

### Test 1: List Auth Users
Ask me:
> "Can you run: SELECT COUNT(*) FROM auth.users"

### Test 2: List Tables
Ask me:
> "What tables exist in my database?"

### Test 3: Create the Users Table
Ask me:
> "Create the users table from SETUP_DATABASE_MINIMAL.sql"

If all three work, the MCP is properly configured! 🎉

---

## 🐛 Troubleshooting

### "Authentication failed"
- Make sure you logged in with the correct Supabase account
- Select the right organization and project
- Try logging out and back in

### "Connection refused"
- Check that you restarted Cursor
- Verify the project_ref is correct: `vpqxigieedjwqmxducku`
- Check your internet connection

### "No tools available"
- The MCP server might not be responding
- Try removing and re-adding the configuration
- Restart Cursor again

### "Permission denied"
- Make sure you granted all requested permissions during OAuth flow
- Check your Supabase role (should be Owner or Admin)

---

## 📖 Official Resources

- **Official Docs:** https://supabase.com/docs/guides/getting-started/mcp
- **MCP Server URL:** https://mcp.supabase.com/mcp
- **Your Project:** https://supabase.com/dashboard/project/vpqxigieedjwqmxducku
- **Security Guidelines:** https://supabase.com/docs/guides/getting-started/mcp#security

---

## 🎉 What Happens Next

Once MCP is working, I can:

1. ✅ **Execute the setup SQL directly** (no more copy/paste!)
2. ✅ **Create tables on the fly**
3. ✅ **Insert seed data**
4. ✅ **Fix RLS policies**
5. ✅ **Verify database state**
6. ✅ **Run migrations automatically**

This will make development **100x faster**! 🚀

---

## 🔄 Current Status

- ✅ Configuration updated in `~/.cursor/mcp.json`
- ⏳ **Next:** Restart Cursor and authenticate
- ⏳ **Then:** Test by asking me to query the database

---

**Restart Cursor now and let's test it!** 🎯

